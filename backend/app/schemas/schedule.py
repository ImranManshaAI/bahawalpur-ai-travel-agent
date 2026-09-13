from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class ScheduleErrorResponse(BaseModel):
    code: str
    message: str
    details: dict | None = None


# ---------- POST /admin/schedules ----------


class ScheduleCreateRequest(BaseModel):
    bus_id: UUID
    route_id: UUID
    travel_date: date
    timing_slot: str = Field(min_length=1)


class ScheduleCreateData(BaseModel):
    id: UUID
    bus_id: UUID
    route_id: UUID
    travel_date: date
    timing_slot: str
    status: str
    created_at: datetime
    seats_generated: int


class ScheduleCreateResponse(BaseModel):
    data: ScheduleCreateData | None = None
    error: ScheduleErrorResponse | None = None


# ---------- GET /schedules?date= ----------


class ScheduleListItem(BaseModel):
    schedule_instance_id: UUID
    route_id: UUID
    route_name: str
    travel_date: date
    timing_slot: str
    status: str
    total_seats: int
    available_seats: int


class ScheduleListResponse(BaseModel):
    data: list[ScheduleListItem] | None = None
    error: ScheduleErrorResponse | None = None


# ---------- GET /schedules/{id}/seats ----------


class SeatMapItem(BaseModel):
    seat_id: UUID
    seat_number: int
    deck: str
    status: str


class ScheduleSeatMapData(BaseModel):
    schedule_instance_id: UUID
    travel_date: date
    timing_slot: str
    status: str
    seats: list[SeatMapItem]


class ScheduleSeatMapResponse(BaseModel):
    data: ScheduleSeatMapData | None = None
    error: ScheduleErrorResponse | None = None


# ---------- PATCH /admin/schedules/{id} ----------


class SchedulePatchRequest(BaseModel):
    status: Literal["open", "closed"]


class SchedulePatchData(BaseModel):
    id: UUID
    bus_id: UUID
    route_id: UUID
    travel_date: date
    timing_slot: str
    status: str


class SchedulePatchResponse(BaseModel):
    data: SchedulePatchData | None = None
    error: ScheduleErrorResponse | None = None
