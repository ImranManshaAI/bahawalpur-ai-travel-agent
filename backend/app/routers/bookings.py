import re
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter
from psycopg.errors import RaiseException

from app.core.errors import InvalidReferenceError
from app.schemas.booking import (
    BookingHoldRequest,
    BookingHoldResponse,
    BookingResponse,
    CreateBookingRequest,
    ErrorResponse,
    PaymentProofResponse,
)

from app.services.booking import (
    DuplicateSeatIdsError,
    ScheduleNotFoundError,
    ScheduleNotOpenError,
    classify_hold_failure,
    create_booking,
    create_booking_hold,
    get_seat_numbers,
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

    except ValueError as exc:
        return BookingResponse(
            data=None,
            error=ErrorResponse(
                code="BOOKING_INVALID",
                message=str(exc),
                details=None,
            ),
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

from fastapi import File, UploadFile

@router.post("/{booking_id}/payment-proof", response_model=PaymentProofResponse)
def payment_proof_endpoint(
    booking_id: UUID,
    file: UploadFile = File(...),
):
    try:
        file_bytes = file.file.read()

        proof = upload_payment_proof(
            booking_id=booking_id,
            file_bytes=file_bytes,
            filename=file.filename or "payment-proof",
            content_type=file.content_type or "application/octet-stream",
        )

    except ValueError as exc:
        return PaymentProofResponse(
            data=None,
            error=ErrorResponse(
                code="PAYMENT_PROOF_INVALID",
                message=str(exc),
                details=None,
            ),
        )

    return PaymentProofResponse(
        data={
            "payment_proof_id": proof["id"],
            "booking_id": proof["booking_id"],
            "screenshot_url": proof["screenshot_url"],
            "status": proof["status"],
        },
        error=None,
    )