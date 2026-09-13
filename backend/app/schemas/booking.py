from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class BookingHoldRequest(BaseModel):
    schedule_id: UUID
    seat_ids: list[UUID] = Field(min_length=1)


class BookingHoldData(BaseModel):
    hold_id: UUID
    token: UUID
    seat_ids: list[UUID]
    status: str
    held_at: datetime
    hold_expires_at: datetime
    remaining_seconds: int


class ErrorDetails(BaseModel):
    unavailable_seat_ids: list[UUID] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    code: str
    message: str
    details: ErrorDetails | None = None


class BookingHoldResponse(BaseModel):
    data: BookingHoldData | None = None
    error: ErrorResponse | None = None

class CreateBookingRequest(BaseModel):
    hold_token: UUID
    visitor_name: str = Field(min_length=1)
    visitor_phone: str = Field(min_length=1)
    visitor_email: str | None = None
    passenger_count: int = Field(ge=1)


class BookingData(BaseModel):
    booking_id: UUID
    booking_ref: str
    status: str
    booking_type: str
    schedule_id: UUID
    passenger_count: int
    total_price: float


class BookingResponse(BaseModel):
    data: BookingData | None = None
    error: ErrorResponse | None = None

class PaymentProofData(BaseModel):
    payment_proof_id: UUID
    booking_id: UUID
    screenshot_url: str
    status: str
    payment_method_id: UUID | None = None
    transaction_reference: str | None = None
    amount_claimed: float | None = None


class PaymentProofResponse(BaseModel):
    data: PaymentProofData | None = None
    error: ErrorResponse | None = None


# ---------- GET /bookings/status ----------


class BookingStatusSeat(BaseModel):
    seat_number: int
    deck: str


class BookingStatusData(BaseModel):
    booking_id: UUID
    booking_ref: str
    travel_date: date
    timing_slot: str
    seats: list[BookingStatusSeat]
    passenger_count: int
    total_price: float
    booking_status: str
    payment_status: str | None = None
    status_message: str


class BookingStatusResponse(BaseModel):
    data: list[BookingStatusData] | None = None
    error: ErrorResponse | None = None