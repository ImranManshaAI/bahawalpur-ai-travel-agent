from uuid import UUID

from fastapi import APIRouter

from app.schemas.schedule import (
    ScheduleCreateRequest,
    ScheduleCreateResponse,
    SchedulePatchRequest,
    SchedulePatchResponse,
)
from app.services.schedule import create_schedule, update_schedule_status

router = APIRouter(prefix="/admin/schedules", tags=["Admin Schedules"])


@router.post("", response_model=ScheduleCreateResponse, status_code=201)
def create_schedule_endpoint(request: ScheduleCreateRequest):
    schedule = create_schedule(
        bus_id=request.bus_id,
        route_id=request.route_id,
        travel_date=request.travel_date,
        timing_slot=request.timing_slot,
    )

    return ScheduleCreateResponse(data=schedule, error=None)


@router.patch("/{schedule_id}", response_model=SchedulePatchResponse, status_code=200)
def update_schedule_status_endpoint(schedule_id: UUID, request: SchedulePatchRequest):
    schedule = update_schedule_status(schedule_id=schedule_id, status=request.status)

    return SchedulePatchResponse(data=schedule, error=None)
