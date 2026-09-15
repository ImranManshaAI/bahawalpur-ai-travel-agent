from datetime import date
from uuid import UUID

from fastapi import APIRouter

from app.schemas.schedule import ScheduleListResponse, ScheduleSeatMapResponse
from app.services.schedule import get_seat_map, list_schedules

router = APIRouter(prefix="/schedules", tags=["Schedules"])


@router.get("", response_model=ScheduleListResponse, status_code=200)
def list_schedules_endpoint(date: date):
    schedules = list_schedules(travel_date=date)

    return ScheduleListResponse(data=schedules, error=None)


@router.get("/{schedule_id}/seats", response_model=ScheduleSeatMapResponse, status_code=200)
def get_seat_map_endpoint(schedule_id: UUID):
    seat_map = get_seat_map(schedule_id=schedule_id)

    return ScheduleSeatMapResponse(data=seat_map, error=None)
