"""Phase 5 tool registry: OpenAI-compatible definitions plus execution
that calls existing schedule/booking services. No provider loop, no HTTP
route, no duplicated business logic.
"""
from __future__ import annotations

import json
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any
from uuid import UUID

from psycopg.errors import RaiseException
from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator

from app.core.errors import InvalidReferenceError, NotFoundError
from app.services.booking import (
    DuplicateSeatIdsError,
    HoldNotUsableError,
    PassengerCountMismatchError,
    PricingNotConfiguredError,
    ScheduleNotFoundError,
    ScheduleNotOpenError,
    classify_booking_failure,
    classify_hold_failure,
    create_booking,
    create_booking_hold,
    lookup_booking_status,
)
from app.services.schedule import get_seat_map, list_schedules

TOOL_NAMES = (
    "check_availability",
    "get_seat_map",
    "create_booking_hold",
    "submit_booking",
    "get_booking_status",
)


class _ToolArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")


class CheckAvailabilityArgs(_ToolArgs):
    date: date


class GetSeatMapArgs(_ToolArgs):
    schedule_id: UUID


class CreateBookingHoldArgs(_ToolArgs):
    schedule_id: UUID
    seat_ids: list[UUID] = Field(min_length=1)


class SubmitBookingArgs(_ToolArgs):
    hold_token: UUID
    visitor_name: str = Field(min_length=1)
    visitor_phone: str = Field(min_length=1)
    passenger_count: int = Field(ge=1)
    visitor_email: str | None = None


class GetBookingStatusArgs(_ToolArgs):
    ref: str | None = None
    phone: str | None = None
    email: str | None = None

    @model_validator(mode="after")
    def exactly_one_lookup_field(self) -> GetBookingStatusArgs:
        provided = [value for value in (self.ref, self.phone, self.email) if value]
        if len(provided) != 1:
            raise ValueError("Provide exactly one of ref, phone, or email.")
        return self


TOOL_DEFINITIONS: list[dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "check_availability",
            "description": (
                "Look up live open TDCP Double-Decker schedule slots for a "
                "travel date, including how many seats are currently available. "
                "Does not return prices. Call this instead of guessing availability."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {
                        "type": "string",
                        "format": "date",
                        "description": "Travel date in ISO format YYYY-MM-DD.",
                    }
                },
                "required": ["date"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_seat_map",
            "description": (
                "Return the live seat map for one schedule instance "
                "(seat id, number, deck, and status). Call this instead of "
                "guessing which seats are free."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "schedule_id": {
                        "type": "string",
                        "format": "uuid",
                        "description": "Schedule instance id from check_availability.",
                    }
                },
                "required": ["schedule_id"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_booking_hold",
            "description": (
                "Place a temporary hold on selected seats for a schedule. "
                "Use seat ids from get_seat_map. The hold expires; the visitor "
                "must submit a booking before it lapses."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "schedule_id": {
                        "type": "string",
                        "format": "uuid",
                        "description": "Schedule instance id.",
                    },
                    "seat_ids": {
                        "type": "array",
                        "items": {"type": "string", "format": "uuid"},
                        "minItems": 1,
                        "description": "Seat ids to hold.",
                    },
                },
                "required": ["schedule_id", "seat_ids"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "submit_booking",
            "description": (
                "Create a booking from a valid hold token. The server calculates "
                "the total price; do not invent or supply a price. Requires the "
                "visitor's name, phone, and passenger_count matching the held seats."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "hold_token": {
                        "type": "string",
                        "format": "uuid",
                        "description": "hold_token returned by create_booking_hold.",
                    },
                    "visitor_name": {"type": "string", "minLength": 1},
                    "visitor_phone": {"type": "string", "minLength": 1},
                    "passenger_count": {
                        "type": "integer",
                        "minimum": 1,
                        "description": "Must match the number of held seats.",
                    },
                    "visitor_email": {"type": "string"},
                },
                "required": [
                    "hold_token",
                    "visitor_name",
                    "visitor_phone",
                    "passenger_count",
                ],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_booking_status",
            "description": (
                "Look up existing booking(s) by exactly one of booking reference, "
                "phone, or email. Returns date, timing, seats, amount, and status."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "ref": {
                        "type": "string",
                        "description": "Booking reference (e.g. TDCP-YYYYMMDD-xxxxxxxx).",
                    },
                    "phone": {"type": "string"},
                    "email": {"type": "string"},
                },
                "required": [],
                "additionalProperties": False,
            },
        },
    },
]


def _json_ready(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): _json_ready(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_json_ready(item) for item in value]
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    return value


def _ok(data: Any) -> dict[str, Any]:
    return {"ok": True, "data": _json_ready(data), "error": None}


def _err(code: str, message: str) -> dict[str, Any]:
    return {"ok": False, "data": None, "error": {"code": code, "message": message}}


def _parse_arguments(arguments: dict[str, Any] | str | None) -> dict[str, Any]:
    if arguments is None:
        return {}
    if isinstance(arguments, str):
        if not arguments.strip():
            return {}
        parsed = json.loads(arguments)
        if not isinstance(parsed, dict):
            raise ValueError("Tool arguments must be a JSON object.")
        return parsed
    if isinstance(arguments, dict):
        return arguments
    raise ValueError("Tool arguments must be a JSON object.")


def _public_schedules(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "schedule_instance_id": row["schedule_instance_id"],
            "route_id": row["route_id"],
            "route_name": row["route_name"],
            "travel_date": row["travel_date"],
            "timing_slot": row["timing_slot"],
            "status": row["status"],
            "total_seats": row["total_seats"],
            "available_seats": row["available_seats"],
        }
        for row in rows
    ]


def _public_seat_map(seat_map: dict[str, Any]) -> dict[str, Any]:
    return {
        "schedule_instance_id": seat_map["schedule_instance_id"],
        "travel_date": seat_map["travel_date"],
        "timing_slot": seat_map["timing_slot"],
        "status": seat_map["status"],
        "seats": [
            {
                "seat_id": seat["seat_id"],
                "seat_number": seat["seat_number"],
                "deck": seat["deck"],
                "status": seat["status"],
            }
            for seat in seat_map["seats"]
        ],
    }


def _public_hold(hold: dict[str, Any]) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    remaining_seconds = max(0, int((hold["expires_at"] - now).total_seconds()))
    return {
        "hold_id": hold["hold_id"],
        "hold_token": hold["hold_token"],
        "seat_ids": hold["seat_ids"],
        "held_at": hold["held_at"],
        "expires_at": hold["expires_at"],
        "remaining_seconds": remaining_seconds,
    }


def _public_booking_status(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "booking_id": row["booking_id"],
            "booking_ref": row["booking_ref"],
            "travel_date": row["travel_date"],
            "timing_slot": row["timing_slot"],
            "seats": row["seats"],
            "passenger_count": row["passenger_count"],
            "total_price": row["total_price"],
            "booking_status": row["booking_status"],
            "payment_status": row["payment_status"],
            "status_message": row["status_message"],
        }
        for row in rows
    ]


def _run_check_availability(args: dict[str, Any]) -> dict[str, Any]:
    parsed = CheckAvailabilityArgs.model_validate(args)
    schedules = list_schedules(travel_date=parsed.date)
    return _ok(_public_schedules(schedules))


def _run_get_seat_map(args: dict[str, Any]) -> dict[str, Any]:
    parsed = GetSeatMapArgs.model_validate(args)
    return _ok(_public_seat_map(get_seat_map(schedule_id=parsed.schedule_id)))


def _run_create_booking_hold(args: dict[str, Any]) -> dict[str, Any]:
    parsed = CreateBookingHoldArgs.model_validate(args)
    try:
        hold = create_booking_hold(
            schedule_id=parsed.schedule_id,
            seat_ids=parsed.seat_ids,
        )
    except DuplicateSeatIdsError as exc:
        return _err("DUPLICATE_SEAT_IDS", str(exc))
    except ScheduleNotFoundError as exc:
        return _err("SCHEDULE_NOT_FOUND", str(exc))
    except ScheduleNotOpenError as exc:
        return _err("SCHEDULE_CLOSED", str(exc))
    except InvalidReferenceError as exc:
        return _err("SEAT_NOT_FOUND", str(exc))
    except RaiseException as exc:
        code, message = classify_hold_failure(str(exc))
        return _err(code, message)
    return _ok(_public_hold(hold))


def _run_submit_booking(args: dict[str, Any]) -> dict[str, Any]:
    if "total_price" in args or "price" in args:
        return _err(
            "INVALID_TOOL_ARGUMENTS",
            "Price is calculated by the server and cannot be supplied.",
        )

    parsed = SubmitBookingArgs.model_validate(args)
    try:
        booking = create_booking(
            hold_token=parsed.hold_token,
            visitor_name=parsed.visitor_name,
            visitor_phone=parsed.visitor_phone,
            visitor_email=parsed.visitor_email,
            passenger_count=parsed.passenger_count,
        )
    except HoldNotUsableError as exc:
        return _err("HOLD_NOT_FOUND", str(exc))
    except PassengerCountMismatchError as exc:
        return _err("PASSENGER_COUNT_MISMATCH", str(exc))
    except PricingNotConfiguredError as exc:
        return _err("PRICING_CONFIGURATION_ERROR", str(exc))
    except RaiseException as exc:
        code, message = classify_booking_failure(str(exc))
        return _err(code, message)

    return _ok(
        {
            "booking_id": booking["id"],
            "booking_ref": booking["booking_ref"],
            "status": booking["booking_status"],
            "booking_type": booking["booking_type"],
            "schedule_id": booking["schedule_instance_id"],
            "passenger_count": booking["passenger_count"],
            "total_price": booking["total_price"],
        }
    )


def _run_get_booking_status(args: dict[str, Any]) -> dict[str, Any]:
    provided = [key for key in ("ref", "phone", "email") if args.get(key)]
    if len(provided) != 1:
        return _err("INVALID_LOOKUP", "Provide exactly one of ref, phone, or email.")

    parsed = GetBookingStatusArgs.model_validate(args)
    results = lookup_booking_status(
        booking_ref=parsed.ref,
        visitor_phone=parsed.phone,
        visitor_email=parsed.email,
    )
    return _ok(_public_booking_status(results))


_HANDLERS = {
    "check_availability": _run_check_availability,
    "get_seat_map": _run_get_seat_map,
    "create_booking_hold": _run_create_booking_hold,
    "submit_booking": _run_submit_booking,
    "get_booking_status": _run_get_booking_status,
}


def execute_tool(name: str, arguments: dict[str, Any] | str | None = None) -> dict[str, Any]:
    """Validate arguments, call the matching existing service, return a
    JSON-ready {ok, data, error} result for the future OpenRouter loop.
    """
    if name not in _HANDLERS:
        return _err("UNKNOWN_TOOL", "That tool is not available.")

    try:
        parsed_args = _parse_arguments(arguments)
    except (ValueError, json.JSONDecodeError):
        return _err("INVALID_TOOL_ARGUMENTS", "Tool arguments were not valid JSON.")

    try:
        return _HANDLERS[name](parsed_args)
    except ValidationError:
        return _err("INVALID_TOOL_ARGUMENTS", "Tool arguments were incomplete or invalid.")
    except NotFoundError as exc:
        return _err("SCHEDULE_NOT_FOUND", str(exc))
    except Exception:
        return _err("TOOL_FAILED", "The request could not be completed. Please try again.")
