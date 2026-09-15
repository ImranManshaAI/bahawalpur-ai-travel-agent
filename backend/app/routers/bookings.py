import re
from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, File, Form, UploadFile
from psycopg.errors import RaiseException

from app.core.errors import InvalidReferenceError
from app.schemas.booking import (
    BookingHoldRequest,
    BookingHoldResponse,
    BookingResponse,
    BookingStatusResponse,
    CreateBookingRequest,
    ErrorResponse,
    PaymentProofResponse,
)

from app.services.booking import (
    BookingNotFoundError,
    DuplicateSeatIdsError,
    HoldNotUsableError,
    InvalidPaymentProofFileError,
    PassengerCountMismatchError,
    PaymentProofNotAllowedError,
    PaymentProofStorageError,
    PricingNotConfiguredError,
    ScheduleNotFoundError,
    ScheduleNotOpenError,
    classify_booking_failure,
    classify_hold_failure,
    create_booking,
    create_booking_hold,
    get_seat_numbers,
    lookup_booking_status,
    upload_payment_proof,
)


router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("/hold", response_model=BookingHoldResponse)
def hold_seats(request: BookingHoldRequest):
    try:
        result = create_booking_hold(
            schedule_id=request.schedule_id,
            seat_ids=request.seat_ids,
        )

    except DuplicateSeatIdsError as exc:
        return BookingHoldResponse(
            data=None,
            error={"code": "DUPLICATE_SEAT_IDS", "message": str(exc), "details": None},
        )

    except ScheduleNotFoundError as exc:
        return BookingHoldResponse(
            data=None,
            error={"code": "SCHEDULE_NOT_FOUND", "message": str(exc), "details": None},
        )

    except ScheduleNotOpenError as exc:
        return BookingHoldResponse(
            data=None,
            error={"code": "SCHEDULE_CLOSED", "message": str(exc), "details": None},
        )

    except InvalidReferenceError as exc:
        return BookingHoldResponse(
            data=None,
            error={"code": "SEAT_NOT_FOUND", "message": str(exc), "details": None},
        )

    except RaiseException as exc:
        message = str(exc)
        code, client_message = classify_hold_failure(message)

        details = None

        if code == "SEAT_UNAVAILABLE":
            match = re.search(r"Seat\(s\) \{([^}]*)\}", message)

            unavailable_seat_ids = []

            if match:
                unavailable_seat_numbers = {
                    int(value.strip())
                    for value in match.group(1).split(",")
                    if value.strip()
                }

                seat_map = get_seat_numbers(
                    schedule_id=request.schedule_id,
                    seat_ids=request.seat_ids,
                )

                unavailable_seat_ids = [
                    seat_id
                    for seat_id, seat_number in seat_map.items()
                    if seat_number in unavailable_seat_numbers
                ]

            details = {"unavailable_seat_ids": unavailable_seat_ids}

        return BookingHoldResponse(
            data=None,
            error={"code": code, "message": client_message, "details": details},
        )

    now = datetime.now(timezone.utc)

    remaining_seconds = max(
        0,
        int((result["expires_at"] - now).total_seconds()),
    )

    return BookingHoldResponse(
        data={
            "hold_id": result["hold_id"],
            "token": result["hold_token"],
            "seat_ids": result["seat_ids"],
            "status": "held",
            "held_at": result["held_at"],
            "hold_expires_at": result["expires_at"],
            "remaining_seconds": remaining_seconds,
        },
        error=None,
    )


@router.get("/status", response_model=BookingStatusResponse)
def get_booking_status(
    ref: str | None = None,
    phone: str | None = None,
    email: str | None = None,
):
    """SDD 4.6: public lookup by booking reference, phone, or email —
    exactly one of the three, no invented additional restriction."""
    provided = [value for value in (ref, phone, email) if value]

    if len(provided) != 1:
        return BookingStatusResponse(
            data=None,
            error=ErrorResponse(
                code="INVALID_LOOKUP",
                message="Provide exactly one of ref, phone, or email.",
                details=None,
            ),
        )

    results = lookup_booking_status(
        booking_ref=ref,
        visitor_phone=phone,
        visitor_email=email,
    )

    return BookingStatusResponse(
        data=[
            {
                "booking_id": result["booking_id"],
                "booking_ref": result["booking_ref"],
                "travel_date": result["travel_date"],
                "timing_slot": result["timing_slot"],
                "seats": result["seats"],
                "passenger_count": result["passenger_count"],
                "total_price": float(result["total_price"]),
                "booking_status": result["booking_status"],
                "payment_status": result["payment_status"],
                "status_message": result["status_message"],
            }
            for result in results
        ],
        error=None,
    )


@router.post("", response_model=BookingResponse)
def create_booking_endpoint(request: CreateBookingRequest):
    try:
        booking = create_booking(
            hold_token=request.hold_token,
            visitor_name=request.visitor_name,
            visitor_phone=request.visitor_phone,
            visitor_email=request.visitor_email,
            passenger_count=request.passenger_count,
        )

    except HoldNotUsableError as exc:
        return BookingResponse(
            data=None,
            error=ErrorResponse(code="HOLD_NOT_FOUND", message=str(exc), details=None),
        )

    except PassengerCountMismatchError as exc:
        return BookingResponse(
            data=None,
            error=ErrorResponse(
                code="PASSENGER_COUNT_MISMATCH", message=str(exc), details=None
            ),
        )

    except PricingNotConfiguredError as exc:
        return BookingResponse(
            data=None,
            error=ErrorResponse(
                code="PRICING_CONFIGURATION_ERROR", message=str(exc), details=None
            ),
        )

    except RaiseException as exc:
        code, client_message = classify_booking_failure(str(exc))
        return BookingResponse(
            data=None,
            error=ErrorResponse(code=code, message=client_message, details=None),
        )

    return BookingResponse(
        data={
            "booking_id": booking["id"],
            "booking_ref": booking["booking_ref"],
            "status": booking["booking_status"],
            "booking_type": booking["booking_type"],
            "schedule_id": booking["schedule_instance_id"],
            "passenger_count": booking["passenger_count"],
            "total_price": float(booking["total_price"]),
        },
        error=None,
    )


@router.post("/{booking_id}/payment-proof", response_model=PaymentProofResponse)
def payment_proof_endpoint(
    booking_id: UUID,
    file: UploadFile = File(...),
    payment_method_id: UUID | None = Form(None),
    transaction_reference: str | None = Form(None),
    amount_claimed: Decimal | None = Form(None),
):
    try:
        file_bytes = file.file.read()

        proof = upload_payment_proof(
            booking_id=booking_id,
            file_bytes=file_bytes,
            content_type=file.content_type or "application/octet-stream",
            payment_method_id=payment_method_id,
            transaction_reference=transaction_reference,
            amount_claimed=amount_claimed,
        )

    except BookingNotFoundError as exc:
        return PaymentProofResponse(
            data=None,
            error=ErrorResponse(code="BOOKING_NOT_FOUND", message=str(exc), details=None),
        )

    except PaymentProofNotAllowedError as exc:
        return PaymentProofResponse(
            data=None,
            error=ErrorResponse(
                code="PAYMENT_PROOF_NOT_ALLOWED", message=str(exc), details=None
            ),
        )

    except InvalidPaymentProofFileError as exc:
        return PaymentProofResponse(
            data=None,
            error=ErrorResponse(
                code="INVALID_PAYMENT_PROOF_FILE", message=str(exc), details=None
            ),
        )

    except InvalidReferenceError as exc:
        return PaymentProofResponse(
            data=None,
            error=ErrorResponse(
                code="INVALID_PAYMENT_METHOD", message=str(exc), details=None
            ),
        )

    except PaymentProofStorageError as exc:
        return PaymentProofResponse(
            data=None,
            error=ErrorResponse(
                code="PAYMENT_PROOF_STORAGE_ERROR", message=str(exc), details=None
            ),
        )

    return PaymentProofResponse(
        data={
            "payment_proof_id": proof["id"],
            "booking_id": proof["booking_id"],
            "screenshot_url": proof["screenshot_url"],
            "status": proof["status"],
            "payment_method_id": proof["payment_method_id"],
            "transaction_reference": proof["transaction_reference"],
            "amount_claimed": (
                float(proof["amount_claimed"]) if proof["amount_claimed"] is not None else None
            ),
        },
        error=None,
    )
