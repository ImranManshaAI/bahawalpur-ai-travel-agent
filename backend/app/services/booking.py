from uuid import UUID

from psycopg.rows import dict_row

from app.core.database import pool
from app.core.errors import InvalidReferenceError

from supabase import create_client

from app.core.config import settings

supabase = create_client(
    settings.supabase_url,
    settings.supabase_key,
)


class DuplicateSeatIdsError(Exception):
    """Raised when a hold request repeats the same seat_id more than once."""


class ScheduleNotFoundError(Exception):
    """Raised when the referenced schedule_instance does not exist."""


class ScheduleNotOpenError(Exception):
    """Raised when the referenced schedule_instance exists but is not
    'open' (e.g. 'closed') and therefore cannot accept new holds."""


def classify_hold_failure(message: str) -> tuple[str, str]:
    """Map a create_seat_hold() RaiseException message to a stable, safe
    (code, client_message) pair.

    Only the seat-unavailable case is routine, expected client feedback and
    safe to describe. Every other case is a system/business-rule failure,
    not the client's fault, and must never leak raw database text to the
    client (AGENTS.md security rules) — each gets a fixed, generic message.
    """
    if "are not available to hold" in message:
        return "SEAT_UNAVAILABLE", "One or more selected seats are unavailable."

    if "do not exist on schedule" in message:
        return "SEAT_NOT_FOUND", "One or more selected seats do not exist for this schedule."

    if "Hold duration" in message:
        return (
            "HOLD_CONFIGURATION_ERROR",
            "Seat holds are temporarily unavailable due to a system "
            "configuration issue. Please try again later.",
        )

    return "HOLD_FAILED", "Unable to place a hold on the requested seats. Please try again."


def get_seat_numbers(schedule_id: UUID, seat_ids: list[UUID]) -> dict[UUID, int]:
    query = """
        SELECT id, seat_number
        FROM seats
        WHERE schedule_instance_id = %s
          AND id = ANY(%s)
    """

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query, (schedule_id, seat_ids))
            rows = cur.fetchall()

    return {row["id"]: row["seat_number"] for row in rows}



def create_booking_hold(
    schedule_id: UUID,
    seat_ids: list[UUID],
):
    if len(set(seat_ids)) != len(seat_ids):
        raise DuplicateSeatIdsError(
            "Duplicate seat_ids are not allowed in a single hold request."
        )

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            # Lock the schedule row with FOR SHARE, in the SAME transaction
            # that goes on to call create_seat_hold(). A concurrent
            # PATCH /admin/schedules/{id} closing this schedule issues a
            # plain UPDATE, which needs a conflicting row lock on this same
            # row — so it either completes fully before this SELECT (and we
            # correctly observe 'closed'), or it blocks until this
            # transaction commits/rolls back (so a hold that already saw
            # 'open' cannot be preempted mid-flight). This avoids a
            # race-prone plain read of schedule status.
            cur.execute(
                "SELECT status FROM schedule_instances WHERE id = %s FOR SHARE",
                (schedule_id,),
            )
            schedule = cur.fetchone()

            if schedule is None:
                raise ScheduleNotFoundError(f"Schedule instance {schedule_id} not found.")

            if schedule["status"] != "open":
                raise ScheduleNotOpenError(
                    f"Schedule instance {schedule_id} is '{schedule['status']}' "
                    "and is not accepting new holds."
                )

            cur.execute(
                """
                SELECT id, seat_number
                FROM seats
                WHERE schedule_instance_id = %s
                  AND id = ANY(%s)
                """,
                (schedule_id, seat_ids),
            )
            seat_map = {row["id"]: row["seat_number"] for row in cur.fetchall()}

            if len(seat_map) != len(seat_ids):
                missing_seat_ids = [seat_id for seat_id in seat_ids if seat_id not in seat_map]
                raise InvalidReferenceError(
                    f"Seat(s) not found for schedule {schedule_id}: {missing_seat_ids}"
                )

            seat_numbers = [seat_map[seat_id] for seat_id in seat_ids]

            cur.execute(
                "SELECT hold_token, expires_at FROM create_seat_hold(%s, %s)",
                (schedule_id, seat_numbers),
            )
            result = cur.fetchone()

            cur.execute(
                """
                SELECT id, hold_token, created_at, expires_at
                FROM booking_holds
                WHERE hold_token = %s
                """,
                (result["hold_token"],),
            )
            hold = cur.fetchone()

            conn.commit()

    return {
        "hold_id": hold["id"],
        "hold_token": hold["hold_token"],
        "held_at": hold["created_at"],
        "expires_at": hold["expires_at"],
        "seat_ids": seat_ids,
    }


def create_booking(
    hold_token: UUID,
    visitor_name: str,
    visitor_phone: str,
    visitor_email: str | None,
    passenger_count: int,
):
    query = """
        SELECT
            bh.schedule_instance_id,
            COUNT(s.id) AS seat_count,
            r.pricing_model,
            r.price_per_seat,
            r.flat_price
        FROM booking_holds bh
        JOIN seats s
            ON s.hold_id = bh.id
           AND s.status = 'held'
        JOIN schedule_instances si
            ON si.id = bh.schedule_instance_id
        JOIN routes r
            ON r.id = si.route_id
        WHERE bh.hold_token = %s
          AND bh.status = 'active'
        GROUP BY
            bh.schedule_instance_id,
            r.pricing_model,
            r.price_per_seat,
            r.flat_price
    """

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query, (hold_token,))
            hold = cur.fetchone()

            if hold is None:
                raise ValueError("Hold token not found or is no longer active")

            seat_count = hold["seat_count"]

            if passenger_count != seat_count:
                raise ValueError(
                    f"passenger_count must match the number of held seats ({seat_count})"
                )

            if hold["pricing_model"] == "per_seat":
                if hold["price_per_seat"] is None:
                    raise ValueError("Route pricing is not configured")

                total_price = hold["price_per_seat"] * seat_count

            elif hold["pricing_model"] == "flat_rate":
                if hold["flat_price"] is None:
                    raise ValueError("Route pricing is not configured")

                total_price = hold["flat_price"]

            else:
                raise ValueError("Unrecognized route pricing model")

            cur.execute(
                """
                SELECT create_booking_from_hold(
                    %s, %s, %s, %s, %s
                ) AS booking_id
                """,
                (
                    hold_token,
                    visitor_name,
                    visitor_phone,
                    visitor_email,
                    total_price,
                ),
            )

            booking_id = cur.fetchone()["booking_id"]

            cur.execute(
                """
                SELECT
                    id,
                    booking_ref,
                    schedule_instance_id,
                    passenger_count,
                    total_price,
                    booking_type,
                    booking_status
                FROM bookings
                WHERE id = %s
                """,
                (booking_id,),
            )

            booking = cur.fetchone()
            conn.commit()

    return booking

def upload_payment_proof(
    booking_id: UUID,
    file_bytes: bytes,
    filename: str,
    content_type: str,
):
    booking_query = """
        SELECT id, booking_status
        FROM bookings
        WHERE id = %s
    """

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(booking_query, (booking_id,))
            booking = cur.fetchone()

            if booking is None:
                raise ValueError("Booking not found")

            if booking["booking_status"] != "pending_payment":
                raise ValueError(
                    "Payment proof can only be submitted for a pending-payment booking"
                )

    storage_path = f"{booking_id}/{filename}"

    supabase.storage.from_("payment-proofs").upload(
        storage_path,
        file_bytes,
        {"content-type": content_type},
    )

    screenshot_url = storage_path

    insert_query = """
        INSERT INTO payment_proofs (
            booking_id,
            screenshot_url,
            status
        )
        VALUES (%s, %s, 'pending')
        RETURNING id, booking_id, screenshot_url, status
    """

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                insert_query,
                (booking_id, screenshot_url),
            )
            proof = cur.fetchone()
            conn.commit()

    return proof