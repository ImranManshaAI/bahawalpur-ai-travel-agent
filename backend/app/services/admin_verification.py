from datetime import date
from uuid import UUID

from psycopg.rows import dict_row

from app.core.database import pool
from app.services.booking import (
    _PAYMENT_PROOF_BUCKET,
    _SIGNED_URL_EXPIRY_SECONDS,
    supabase,
)

_ALLOWED_PROOF_STATUSES = {"pending_verification", "confirmed", "rejected"}
_ALLOWED_BOOKING_STATUSES = {
    "pending_payment",
    "payment_submitted",
    "confirmed",
    "rejected",
    "expired",
}


class ProofNotFoundError(Exception):
    """Raised when a payment_proofs id does not exist."""


class ProofNotPendingError(Exception):
    """Raised when a proof is not pending_verification (already reviewed)."""


class ConfirmNotAllowedError(Exception):
    """Raised when the booking/hold state cannot be confirmed or rejected."""


class SeatsNotHeldError(Exception):
    """Raised when the booking's held seats are missing or no longer held."""


class InvalidFilterError(Exception):
    """Raised when a query-parameter filter is not an allowed status value."""


def classify_review_failure(message: str, action: str) -> tuple[str, str]:
    """Map confirm/reject RaiseException text to a stable (code, message)."""
    fallback = "CONFIRM_FAILED" if action == "confirm" else "REJECT_FAILED"
    fallback_message = (
        "Unable to confirm this payment proof. Please try again."
        if action == "confirm"
        else "Unable to reject this payment proof. Please try again."
    )

    if "Booking" in message and "not found" in message:
        return "BOOKING_NOT_FOUND", "This booking was not found."

    if "Payment proof" in message and "not found" in message:
        return "PROOF_NOT_FOUND", "This payment proof was not found."

    if "does not belong to booking" in message:
        return "CONFIRM_NOT_ALLOWED", "This payment proof does not belong to its booking."

    if "already reviewed" in message:
        return (
            "PROOF_NOT_PENDING",
            "This payment proof has already been reviewed.",
        )

    if "is not a whole-bus" in message:
        return "CONFIRM_NOT_ALLOWED", "This booking cannot be reviewed through that path."

    if "cannot be confirmed" in message or "cannot be rejected" in message:
        return (
            "CONFIRM_NOT_ALLOWED",
            "This booking is not in a state that can be reviewed.",
        )

    if "no associated seat hold" in message:
        return (
            "CONFIRM_NOT_ALLOWED",
            "This booking has no associated seat hold.",
        )

    if "must hold every seat" in message:
        return (
            "WHOLE_BUS_INCOMPLETE",
            "A whole-bus booking must hold every seat on the schedule.",
        )

    if (
        "No seats are currently linked" in message
        or "no longer in" in message
        or "held' status" in message
        or "held status" in message
    ):
        return (
            "SEATS_NOT_HELD",
            "This booking's seats are no longer held and cannot be reviewed.",
        )

    return fallback, fallback_message


def _signed_screenshot_url(storage_path: str | None) -> str | None:
    if not storage_path:
        return None
    try:
        signed = supabase.storage.from_(_PAYMENT_PROOF_BUCKET).create_signed_url(
            storage_path, _SIGNED_URL_EXPIRY_SECONDS
        )
        if not isinstance(signed, dict):
            return None
        url = signed.get("signedURL") or signed.get("signedUrl")
        if not url or url == storage_path:
            return None
        return url
    except Exception:
        return None


def _seats_by_booking(cur, booking_ids: list[UUID]) -> dict[UUID, list[dict]]:
    if not booking_ids:
        return {}

    cur.execute(
        """
        SELECT bs.booking_id, s.seat_number, s.deck
        FROM booking_seats bs
        JOIN seats s ON s.id = bs.seat_id
        WHERE bs.booking_id = ANY(%s)
        ORDER BY s.deck, s.seat_number
        """,
        (booking_ids,),
    )
    seats: dict[UUID, list[dict]] = {}
    for row in cur.fetchall():
        seats.setdefault(row["booking_id"], []).append(
            {"seat_number": row["seat_number"], "deck": row["deck"]}
        )
    return seats


def list_payment_proofs(status: str) -> list[dict]:
    if status not in _ALLOWED_PROOF_STATUSES:
        raise InvalidFilterError(
            "status must be pending_verification, confirmed, or rejected."
        )

    query = """
        SELECT
            pp.id AS payment_proof_id,
            pp.booking_id,
            pp.status AS payment_status,
            pp.screenshot_url AS storage_key,
            pp.submitted_at,
            pp.amount_claimed,
            pp.transaction_reference,
            b.booking_ref,
            b.visitor_name,
            b.visitor_phone,
            b.visitor_email,
            b.passenger_count,
            b.total_price,
            b.booking_status,
            b.booking_type,
            si.travel_date,
            si.timing_slot
        FROM payment_proofs pp
        JOIN bookings b ON b.id = pp.booking_id
        JOIN schedule_instances si ON si.id = b.schedule_instance_id
        WHERE pp.status = %s
        ORDER BY pp.submitted_at ASC
    """

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query, (status,))
            rows = cur.fetchall()
            seats = _seats_by_booking(cur, [row["booking_id"] for row in rows])

    results = []
    for row in rows:
        results.append(
            {
                "payment_proof_id": row["payment_proof_id"],
                "booking_id": row["booking_id"],
                "booking_ref": row["booking_ref"],
                "visitor_name": row["visitor_name"],
                "visitor_phone": row["visitor_phone"],
                "visitor_email": row["visitor_email"],
                "travel_date": row["travel_date"],
                "timing_slot": row["timing_slot"],
                "seats": seats.get(row["booking_id"], []),
                "passenger_count": row["passenger_count"],
                "total_price": row["total_price"],
                "amount_claimed": row["amount_claimed"],
                "transaction_reference": row["transaction_reference"],
                "booking_status": row["booking_status"],
                "booking_type": row["booking_type"],
                "payment_status": row["payment_status"],
                "screenshot_url": _signed_screenshot_url(row["storage_key"]),
                "submitted_at": row["submitted_at"],
            }
        )
    return results


def list_admin_bookings(
    travel_date: date | None = None,
    booking_status: str | None = None,
) -> list[dict]:
    if booking_status is not None and booking_status not in _ALLOWED_BOOKING_STATUSES:
        raise InvalidFilterError(
            "status must be pending_payment, payment_submitted, confirmed, rejected, or expired."
        )

    clauses = []
    params: list = []
    if travel_date is not None:
        clauses.append("si.travel_date = %s")
        params.append(travel_date)
    if booking_status is not None:
        clauses.append("b.booking_status = %s")
        params.append(booking_status)

    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""

    query = f"""
        SELECT
            b.id AS booking_id,
            b.booking_ref,
            b.visitor_name,
            b.visitor_phone,
            b.visitor_email,
            b.passenger_count,
            b.total_price,
            b.booking_type,
            b.booking_status,
            si.travel_date,
            si.timing_slot,
            pp.status AS payment_status
        FROM bookings b
        JOIN schedule_instances si ON si.id = b.schedule_instance_id
        LEFT JOIN LATERAL (
            SELECT status
            FROM payment_proofs
            WHERE booking_id = b.id
            ORDER BY submitted_at DESC
            LIMIT 1
        ) pp ON true
        {where}
        ORDER BY si.travel_date, si.timing_slot, b.created_at
    """

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query, params)
            rows = cur.fetchall()
            seats = _seats_by_booking(cur, [row["booking_id"] for row in rows])

    return [
        {
            **row,
            "seats": seats.get(row["booking_id"], []),
        }
        for row in rows
    ]


def _lock_proof_and_booking(cur, proof_id: UUID) -> dict:
    cur.execute(
        """
        SELECT
            pp.id AS proof_id,
            pp.booking_id,
            pp.status AS proof_status,
            b.booking_type,
            b.booking_status,
            b.hold_id
        FROM payment_proofs pp
        JOIN bookings b ON b.id = pp.booking_id
        WHERE pp.id = %s
        FOR UPDATE OF pp, b
        """,
        (proof_id,),
    )
    row = cur.fetchone()
    if row is None:
        raise ProofNotFoundError(f"Payment proof {proof_id} was not found.")
    return row


def _assert_reviewable(row: dict) -> None:
    if row["proof_status"] != "pending_verification":
        raise ProofNotPendingError("This payment proof has already been reviewed.")

    if row["booking_status"] not in ("pending_payment", "payment_submitted"):
        raise ConfirmNotAllowedError(
            "This booking is not in a state that can be reviewed."
        )

    if row["hold_id"] is None:
        raise ConfirmNotAllowedError("This booking has no associated seat hold.")


def _confirm_per_seat(cur, row: dict, reviewed_by: UUID) -> None:
    _assert_reviewable(row)

    cur.execute(
        """
        SELECT id, status
        FROM seats
        WHERE hold_id = %s
        FOR UPDATE
        """,
        (row["hold_id"],),
    )
    seats = cur.fetchall()
    if not seats:
        raise SeatsNotHeldError("This booking has no held seats to confirm.")

    if any(seat["status"] != "held" for seat in seats):
        raise SeatsNotHeldError(
            "This booking's seats are no longer held and cannot be confirmed."
        )

    seat_ids = [seat["id"] for seat in seats]

    cur.execute(
        """
        UPDATE payment_proofs
        SET status = 'confirmed',
            reviewed_by = %s,
            reviewed_at = now()
        WHERE id = %s
        """,
        (reviewed_by, row["proof_id"]),
    )
    cur.execute(
        """
        UPDATE seats
        SET status = 'booked',
            hold_expires_at = NULL,
            hold_id = NULL
        WHERE id = ANY(%s)
          AND hold_id = %s
          AND status = 'held'
        """,
        (seat_ids, row["hold_id"]),
    )
    cur.execute(
        """
        INSERT INTO booking_seats (booking_id, seat_id)
        SELECT %s, sid FROM unnest(%s::uuid[]) AS sid
        ON CONFLICT (booking_id, seat_id) DO NOTHING
        """,
        (row["booking_id"], seat_ids),
    )
    cur.execute(
        "UPDATE bookings SET booking_status = 'confirmed' WHERE id = %s",
        (row["booking_id"],),
    )


def _reject_per_seat(cur, row: dict, reviewed_by: UUID, reason: str | None) -> None:
    _assert_reviewable(row)

    cur.execute(
        "SELECT id FROM seats WHERE hold_id = %s FOR UPDATE",
        (row["hold_id"],),
    )
    cur.fetchall()

    cur.execute(
        """
        UPDATE payment_proofs
        SET status = 'rejected',
            reviewed_by = %s,
            reviewed_at = now(),
            review_notes = %s
        WHERE id = %s
        """,
        (reviewed_by, reason, row["proof_id"]),
    )
    cur.execute(
        "UPDATE bookings SET booking_status = 'rejected' WHERE id = %s",
        (row["booking_id"],),
    )
    cur.execute(
        """
        UPDATE seats
        SET status = 'available',
            hold_expires_at = NULL,
            hold_id = NULL
        WHERE hold_id = %s
          AND status = 'held'
        """,
        (row["hold_id"],),
    )
    cur.execute(
        """
        UPDATE booking_holds
        SET status = 'released'
        WHERE id = %s
          AND status = 'converted'
        """,
        (row["hold_id"],),
    )


def _correct_reserved_seats_to_booked(cur, booking_id: UUID) -> None:
    cur.execute(
        """
        UPDATE seats
        SET status = 'booked'
        WHERE id IN (
            SELECT seat_id FROM booking_seats WHERE booking_id = %s
        )
          AND status = 'reserved'
        """,
        (booking_id,),
    )


def _reviewed_state(cur, proof_id: UUID) -> dict:
    cur.execute(
        """
        SELECT
            pp.id AS payment_proof_id,
            pp.booking_id,
            pp.status AS payment_status,
            b.booking_status
        FROM payment_proofs pp
        JOIN bookings b ON b.id = pp.booking_id
        WHERE pp.id = %s
        """,
        (proof_id,),
    )
    return cur.fetchone()


def confirm_payment_proof(proof_id: UUID, reviewed_by: UUID) -> dict:
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            row = _lock_proof_and_booking(cur, proof_id)

            if row["booking_type"] == "whole_bus":
                cur.execute(
                    "SELECT confirm_whole_bus_booking(%s, %s, %s)",
                    (row["booking_id"], proof_id, reviewed_by),
                )
                _correct_reserved_seats_to_booked(cur, row["booking_id"])
            else:
                _confirm_per_seat(cur, row, reviewed_by)

            result = _reviewed_state(cur, proof_id)
            conn.commit()

    return result


def reject_payment_proof(
    proof_id: UUID,
    reviewed_by: UUID,
    reason: str | None = None,
) -> dict:
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            row = _lock_proof_and_booking(cur, proof_id)

            if row["booking_type"] == "whole_bus":
                cur.execute(
                    "SELECT reject_whole_bus_booking(%s, %s, %s, %s)",
                    (row["booking_id"], proof_id, reviewed_by, reason),
                )
            else:
                _reject_per_seat(cur, row, reviewed_by, reason)

            result = _reviewed_state(cur, proof_id)
            conn.commit()

    return result
