import uuid
from decimal import Decimal
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


class HoldNotUsableError(Exception):
    """Raised when a hold_token does not resolve to a hold that currently
    has any 'held' seats (not found, wrong status, or its seats have
    already been released some other way)."""


class PassengerCountMismatchError(Exception):
    """Raised when passenger_count does not match the number of seats
    actually held by this hold_token."""


class PricingNotConfiguredError(Exception):
    """Raised when the schedule's route has no usable price configured,
    or has an unrecognized pricing_model."""


class BookingNotFoundError(Exception):
    """Raised when a booking_id does not resolve to an existing booking."""


class PaymentProofNotAllowedError(Exception):
    """Raised when a payment proof cannot be accepted for a booking because
    it is not (or is no longer) 'pending_payment' — already submitted,
    confirmed, rejected, or expired."""


class InvalidPaymentProofFileError(Exception):
    """Raised when the uploaded file fails content-type/size validation."""


class PaymentProofStorageError(Exception):
    """Raised when the Supabase Storage upload or signed-URL generation
    fails for a reason outside the client's control."""


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


def classify_booking_failure(message: str) -> tuple[str, str]:
    """Map a create_booking_from_hold() RaiseException message to a
    stable, safe (code, client_message) pair. Same intent as
    classify_hold_failure — never leak raw database text to the client.
    """
    if "Hold token not found" in message:
        return "HOLD_NOT_FOUND", "This hold token was not found."

    # Checked before the generic "can no longer be converted" pattern below:
    # the DB function's own expired-hold message text also ends with "...
    # can no longer be converted into a booking", so this specific check
    # must win first or every expired hold would be misclassified as
    # HOLD_NOT_ACTIVE instead of HOLD_EXPIRED.
    if "Hold has expired" in message:
        return "HOLD_EXPIRED", "This hold has expired. Please select seats again."

    if "can no longer be converted" in message:
        return (
            "HOLD_NOT_ACTIVE",
            "This hold is no longer active and can no longer be converted into a booking.",
        )

    if "has no held seats" in message:
        return (
            "HOLD_EXPIRED",
            "This hold's seats are no longer held. Please select seats again.",
        )

    if (
        "Route pricing is not configured" in message
        or "Could not resolve route pricing" in message
        or "Unrecognized pricing_model" in message
        or "does not match the expected price" in message
        or "total_price must be" in message
    ):
        return (
            "PRICING_CONFIGURATION_ERROR",
            "This booking cannot be priced right now due to a system "
            "configuration issue. Please try again later.",
        )

    return "BOOKING_FAILED", "Unable to create a booking from this hold. Please try again."


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
    # Deliberately NOT filtered by `bh.status = 'active'`, and seats are
    # LEFT JOINed (not INNER JOINed): a hold_token that exists but is
    # already converted/released/expired must still reach
    # create_booking_from_hold() below so *its* row-locked, authoritative
    # status/expiry checks produce the specific error (HOLD_NOT_ACTIVE /
    # HOLD_EXPIRED / "no held seats left"). If this pre-check filtered on
    # status itself, every one of those cases would collapse into a single
    # generic "not found" here, before the DB function ever got a chance to
    # classify them precisely — this was caught by tests during
    # implementation (see test_bookings_phase3.py test_a4/test_a5).
    query = """
        SELECT
            bh.id AS hold_id,
            bh.schedule_instance_id,
            COUNT(s.id) AS seat_count,
            r.pricing_model,
            r.price_per_seat,
            r.flat_price
        FROM booking_holds bh
        LEFT JOIN seats s
            ON s.hold_id = bh.id
           AND s.status = 'held'
        JOIN schedule_instances si
            ON si.id = bh.schedule_instance_id
        JOIN routes r
            ON r.id = si.route_id
        WHERE bh.hold_token = %s
        GROUP BY
            bh.id,
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
                raise HoldNotUsableError("Hold token not found.")

            seat_count = hold["seat_count"]
            total_price: Decimal | None = None

            if seat_count > 0:
                # Only meaningful to validate passenger_count/pricing when
                # there are actually currently-held seats to compare
                # against and price. If seat_count is 0 (hold token exists
                # but nothing about it is currently 'held' — e.g. already
                # converted with seats detached some other way, released,
                # or expired-and-swept), total_price is left None:
                # create_booking_from_hold()'s own status/expiry/seat-count
                # checks run before it ever inspects p_total_price (see
                # database/final_schema.sql), so this hold is guaranteed to
                # fail there first with a specific, correctly classified
                # error — the placeholder value is never actually used.
                if passenger_count != seat_count:
                    raise PassengerCountMismatchError(
                        f"passenger_count must match the number of held seats ({seat_count})"
                    )

                if hold["pricing_model"] == "per_seat":
                    if hold["price_per_seat"] is None:
                        raise PricingNotConfiguredError(
                            "Route pricing (price per seat) is not configured for this schedule."
                        )

                    total_price = hold["price_per_seat"] * seat_count

                elif hold["pricing_model"] == "flat_rate":
                    if hold["flat_price"] is None:
                        raise PricingNotConfiguredError(
                            "Route pricing (flat price) is not configured for this schedule."
                        )

                    total_price = hold["flat_price"]

                else:
                    raise PricingNotConfiguredError(
                        "This schedule's route has an unrecognized pricing model."
                    )

            # create_booking_from_hold() independently re-validates hold
            # status/expiry and re-derives + cross-checks total_price under
            # its own row lock (see database/final_schema.sql) — this
            # Python-side computation is only used to supply p_total_price
            # and to give clearer, earlier error messages; the DB function
            # remains the authority. Any RaiseException it raises (hold
            # expired/converted/etc, price mismatch, ...) is intentionally
            # left uncaught here and propagates to the router, exactly like
            # create_seat_hold()'s RaiseException does for create_booking_hold.
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

            # Phase 3 fix: create_booking_from_hold() marks the hold
            # 'converted' but deliberately never clears seats.hold_expires_at
            # on the seats it just booked. expire_stale_holds() — called
            # lazily from every seat-map/schedule read — does a blanket
            # `UPDATE seats SET status='available', ... WHERE status='held'
            # AND hold_expires_at < now()` with no check on booking_holds
            # status. Left alone, once the *original* short hold TTL
            # passes, the very next such read would wrongly release this
            # real, pending-payment booking's seats back to 'available'.
            # Clearing hold_expires_at here (keeping status='held' and
            # hold_id intact, so Phase 4's confirm/reject can still find
            # these seats via hold_id) removes them from that sweep's WHERE
            # clause, in the same transaction as the booking itself.
            cur.execute(
                "UPDATE seats SET hold_expires_at = NULL WHERE hold_id = %s",
                (hold["hold_id"],),
            )

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


# ---------------------------------------------------------------------------
# Payment proof upload
# ---------------------------------------------------------------------------

_PAYMENT_PROOF_BUCKET = "payment-proofs"
_MAX_PAYMENT_PROOF_BYTES = 5 * 1024 * 1024  # 5 MB
_ALLOWED_PAYMENT_PROOF_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
_SIGNED_URL_EXPIRY_SECONDS = 60 * 60  # 1 hour


def upload_payment_proof(
    booking_id: UUID,
    file_bytes: bytes,
    content_type: str,
    payment_method_id: UUID | None = None,
    transaction_reference: str | None = None,
    amount_claimed: Decimal | None = None,
):
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT id, booking_status FROM bookings WHERE id = %s",
                (booking_id,),
            )
            booking = cur.fetchone()

    if booking is None:
        raise BookingNotFoundError(f"Booking {booking_id} not found.")

    if booking["booking_status"] != "pending_payment":
        raise PaymentProofNotAllowedError(
            "A payment proof can only be submitted while this booking is "
            "awaiting payment."
        )

    # AGENTS.md: never trust an uploaded filename or MIME type blindly.
    # Only a small whitelist of real screenshot content-types is accepted,
    # and the storage key is generated server-side rather than using the
    # client-supplied filename.
    extension = _ALLOWED_PAYMENT_PROOF_CONTENT_TYPES.get(content_type)
    if extension is None:
        raise InvalidPaymentProofFileError(
            "Unsupported file type. Please upload a JPEG, PNG, or WEBP screenshot."
        )

    if not file_bytes:
        raise InvalidPaymentProofFileError("The uploaded file is empty.")

    if len(file_bytes) > _MAX_PAYMENT_PROOF_BYTES:
        raise InvalidPaymentProofFileError("The uploaded file is too large (max 5 MB).")

    if payment_method_id is not None:
        with pool.connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    "SELECT id FROM payment_methods WHERE id = %s",
                    (payment_method_id,),
                )
                if cur.fetchone() is None:
                    raise InvalidReferenceError(
                        f"payment_method_id {payment_method_id} does not exist."
                    )

    storage_path = f"{booking_id}/{uuid.uuid4()}{extension}"

    try:
        supabase.storage.from_(_PAYMENT_PROOF_BUCKET).upload(
            storage_path,
            file_bytes,
            {"content-type": content_type},
        )
    except Exception as exc:
        # Broad on purpose: storage3/httpx can raise StorageException for
        # API-level failures (bad bucket, RLS, etc.) but plain httpx
        # network errors (timeouts, connection resets) for transport-level
        # failures — both are "outside the client's control" and must
        # become a clean {data:null, error}, never an unhandled 500.
        raise PaymentProofStorageError(
            "Failed to upload the payment proof file. Please try again."
        ) from exc

    try:
        with pool.connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                # Conditional UPDATE (AGENTS.md concurrency pattern): only
                # transitions if still 'pending_payment', so two near-
                # simultaneous submissions for the same booking can't both
                # succeed. Also implicitly prevents spam re-submission once a
                # proof has been accepted, per SDD 4.6's distinct
                # "payment_submitted" status.
                cur.execute(
                    """
                    UPDATE bookings
                    SET booking_status = 'payment_submitted'
                    WHERE id = %s AND booking_status = 'pending_payment'
                    RETURNING id
                    """,
                    (booking_id,),
                )

                if cur.fetchone() is None:
                    raise PaymentProofNotAllowedError(
                        "A payment proof can only be submitted while this booking is "
                        "awaiting payment."
                    )

                cur.execute(
                    """
                    INSERT INTO payment_proofs (
                        booking_id,
                        screenshot_url,
                        payment_method_id,
                        transaction_reference,
                        amount_claimed,
                        status
                    )
                    VALUES (%s, %s, %s, %s, %s, 'pending_verification')
                    RETURNING
                        id,
                        booking_id,
                        screenshot_url,
                        payment_method_id,
                        transaction_reference,
                        amount_claimed,
                        status
                    """,
                    (
                        booking_id,
                        storage_path,
                        payment_method_id,
                        transaction_reference,
                        amount_claimed,
                    ),
                )
                proof = cur.fetchone()
                conn.commit()
    except Exception:
        # Storage upload already succeeded and is outside this transaction.
        # If the DB transition/insert/commit fails (including the losing
        # concurrent duplicate), best-effort-delete the orphan object.
        # Cleanup errors must never hide the original failure.
        try:
            supabase.storage.from_(_PAYMENT_PROOF_BUCKET).remove([storage_path])
        except Exception:
            pass
        raise

    # Bucket stays private. Persist the raw key in the DB (done above);
    # the API response must be a signed URL, never the raw key.
    try:
        signed = supabase.storage.from_(_PAYMENT_PROOF_BUCKET).create_signed_url(
            storage_path, _SIGNED_URL_EXPIRY_SECONDS
        )
        signed_url = None
        if isinstance(signed, dict):
            signed_url = signed.get("signedURL") or signed.get("signedUrl")
    except Exception as exc:
        raise PaymentProofStorageError(
            "Failed to generate a download URL for the payment proof. Please try again."
        ) from exc

    if not signed_url:
        raise PaymentProofStorageError(
            "Failed to generate a download URL for the payment proof. Please try again."
        )

    return {**proof, "screenshot_url": signed_url}


# ---------------------------------------------------------------------------
# Public booking status lookup
# ---------------------------------------------------------------------------


def _booking_status_message(booking_status: str, payment_status: str | None) -> str:
    """Human-readable status per SDD Section 4.6's exact wording where the
    SDD gives it; other states get a clear, analogous message."""
    if booking_status == "confirmed":
        return "Booking confirmed."

    if booking_status == "rejected":
        return "Payment was rejected. Please contact TDCP for details."

    if booking_status == "expired":
        return "This booking has expired."

    if payment_status == "pending_verification":
        return "Payment proof submitted — awaiting verification."

    return "Awaiting payment."


def lookup_booking_status(
    booking_ref: str | None = None,
    visitor_phone: str | None = None,
    visitor_email: str | None = None,
) -> list[dict]:
    """SDD 4.6: look up booking(s) by reference, phone, or email. Exactly
    one of the three must be provided — enforced by the router. A phone or
    email may legitimately match more than one booking, so this always
    returns a list.
    """
    if booking_ref is not None:
        where_clause = "b.booking_ref = %s"
        param = booking_ref
    elif visitor_phone is not None:
        where_clause = "b.visitor_phone = %s"
        param = visitor_phone
    elif visitor_email is not None:
        where_clause = "b.visitor_email = %s"
        param = visitor_email
    else:
        raise ValueError("Exactly one of booking_ref, visitor_phone, visitor_email is required.")

    query = f"""
        SELECT
            b.id AS booking_id,
            b.booking_ref,
            b.passenger_count,
            b.total_price,
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
        WHERE {where_clause}
        ORDER BY b.created_at DESC
    """

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query, (param,))
            bookings = cur.fetchall()

            if not bookings:
                return []

            booking_ids = [b["booking_id"] for b in bookings]

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
            seat_rows = cur.fetchall()

    seats_by_booking: dict[UUID, list[dict]] = {}
    for row in seat_rows:
        seats_by_booking.setdefault(row["booking_id"], []).append(
            {"seat_number": row["seat_number"], "deck": row["deck"]}
        )

    results = []
    for b in bookings:
        results.append(
            {
                **b,
                "seats": seats_by_booking.get(b["booking_id"], []),
                "status_message": _booking_status_message(
                    b["booking_status"], b["payment_status"]
                ),
            }
        )

    return results
