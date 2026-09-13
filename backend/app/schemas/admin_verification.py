from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class AdminErrorResponse(BaseModel):
    code: str
    message: str
    details: dict | None = None


class AdminLoginRequest(BaseModel):
    email: str = Field(min_length=1)
    password: str = Field(min_length=1)


class AdminLoginData(BaseModel):
    token: str
    admin_id: UUID
    name: str
    email: str


class AdminLoginResponse(BaseModel):
    data: AdminLoginData | None = None
    error: AdminErrorResponse | None = None


class AdminSeatItem(BaseModel):
    seat_number: int
    deck: str


class AdminPaymentProofItem(BaseModel):
    payment_proof_id: UUID
    booking_id: UUID
    booking_ref: str
    visitor_name: str
    visitor_phone: str
    visitor_email: str | None = None
    travel_date: date
    timing_slot: str
    seats: list[AdminSeatItem]
    passenger_count: int
    total_price: float
    amount_claimed: float | None = None
    transaction_reference: str | None = None
    booking_status: str
    booking_type: str
    payment_status: str
    screenshot_url: str | None = None
    submitted_at: datetime


class AdminPaymentProofListResponse(BaseModel):
    data: list[AdminPaymentProofItem] | None = None
    error: AdminErrorResponse | None = None


class AdminRejectRequest(BaseModel):
    reason: str | None = None


class AdminReviewData(BaseModel):
    payment_proof_id: UUID
    booking_id: UUID
    payment_status: str
    booking_status: str


class AdminReviewResponse(BaseModel):
    data: AdminReviewData | None = None
    error: AdminErrorResponse | None = None


class AdminBookingItem(BaseModel):
    booking_id: UUID
    booking_ref: str
    visitor_name: str
    visitor_phone: str
    visitor_email: str | None = None
    travel_date: date
    timing_slot: str
    seats: list[AdminSeatItem]
    passenger_count: int
    total_price: float
    booking_type: str
    booking_status: str
    payment_status: str | None = None


class AdminBookingListResponse(BaseModel):
    data: list[AdminBookingItem] | None = None
    error: AdminErrorResponse | None = None
