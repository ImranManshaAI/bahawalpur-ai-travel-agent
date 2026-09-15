"""Phase 5 (AI Assistant) tests.

OpenRouter/OpenAI is mocked at the SDK boundary. Tool execution uses the
real schedule/booking services against the real test database. No live
OpenRouter HTTP calls.
"""
from __future__ import annotations

import json
import uuid
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
from openai import OpenAIError
from psycopg.rows import dict_row

from app.core.config import settings
from app.core.database import pool
from app.services.agent import SYSTEM_PROMPT, _UNGROUNDED_FALLBACK, _UNAVAILABLE_MESSAGE, run_chat
from app.services.agent_tools import TOOL_DEFINITIONS, execute_tool
from app.services.booking import create_booking as real_create_booking
from app.services.booking import create_booking_hold as real_create_booking_hold
from app.services.booking import lookup_booking_status as real_lookup_booking_status
from app.services.schedule import get_seat_map as real_get_seat_map
from app.services.schedule import list_schedules as real_list_schedules

TIMING_SLOT = "PYTEST PHASE5 AGENT 09:00 AM"
_FAKE_OPENROUTER_KEY = "test-openrouter-key"

_state: dict = {}


def _unique_contact() -> tuple[str, str]:
    suffix = uuid.uuid4().hex[:10]
    return f"0302-{suffix[:7]}", f"pytest-p5-{suffix}@example.com"


def _completion(content=None, tool_calls=None):
    return SimpleNamespace(
        choices=[
            SimpleNamespace(
                message=SimpleNamespace(content=content, tool_calls=tool_calls)
            )
        ]
    )


def _tool_call(call_id, name, arguments, *, include_id=True):
    call = SimpleNamespace(
        type="function",
        function=SimpleNamespace(name=name, arguments=arguments),
    )
    call.id = call_id if include_id else None
    return call


def _chat(client, message, history=None):
    payload = {"message": message}
    if history is not None:
        payload["history"] = history
    return client.post("/agent/chat", json=payload)


def _take_seat() -> str:
    number = _state["next_seat"]
    _state["next_seat"] = number + 1
    return _state["seat_id_by_number"][number]


def _hold_status(hold_token: str) -> str:
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT status FROM booking_holds WHERE hold_token = %s",
                (hold_token,),
            )
            row = cur.fetchone()
    assert row is not None
    return row["status"]


def _booking_row(booking_id: str) -> dict:
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT booking_ref, total_price, visitor_phone, visitor_email,
                       passenger_count, booking_status
                FROM bookings WHERE id = %s
                """,
                (booking_id,),
            )
            return cur.fetchone()


def _assert_success(resp) -> dict:
    assert resp.status_code == 200
    body = resp.json()
    assert set(body.keys()) == {"data", "error"}
    assert body["error"] is None
    assert set(body["data"].keys()) == {"reply", "tool_trace"}
    return body["data"]


def _assert_error(resp, code: str) -> dict:
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == code
    assert body["error"]["message"]
    return body["error"]


def _assert_no_leak(payload) -> None:
    text = json.dumps(payload)
    for fragment in (
        _FAKE_OPENROUTER_KEY,
        "OPENROUTER_API_KEY",
        "traceback",
        "payment-proofs",
        "storage_path",
        "screenshot_url",
        "password_hash",
        "reviewed_by",
    ):
        assert fragment not in text
    for item in payload.get("data", {}).get("tool_trace") or []:
        assert set(item.keys()) <= {"name", "ok"}


def _tool_result_messages(create_mock, call_index: int) -> list[dict]:
    messages = create_mock.call_args_list[call_index].kwargs["messages"]
    return [item for item in messages if item.get("role") == "tool"]


@pytest.fixture(autouse=True)
def openrouter_sdk(monkeypatch):
    """Fake OpenRouter settings and replace the OpenAI client so no test
    can reach the network. create() fails unless a test stubs it.
    """
    monkeypatch.setattr(settings, "openrouter_api_key", _FAKE_OPENROUTER_KEY)
    monkeypatch.setattr(settings, "openrouter_model", "deepseek/deepseek-v4.1-flash")
    monkeypatch.setattr(settings, "openrouter_base_url", "https://openrouter.ai/api/v1")

    mock_client = MagicMock()

    def _unstubbed(*args, **kwargs):
        raise AssertionError(
            "OpenRouter chat.completions.create was not stubbed; "
            "refusing a real network call."
        )

    mock_client.chat.completions.create.side_effect = _unstubbed
    with patch("app.services.agent.OpenAI", return_value=mock_client):
        yield mock_client


@pytest.fixture(scope="module", autouse=True)
def phase5_schedule(client, seed_bus, seed_route, unique_travel_date):
    resp = client.post(
        "/admin/schedules",
        json={
            "bus_id": str(seed_bus["id"]),
            "route_id": str(seed_route["id"]),
            "travel_date": unique_travel_date.isoformat(),
            "timing_slot": TIMING_SLOT,
        },
    )
    assert resp.status_code == 201
    schedule_id = resp.json()["data"]["id"]

    seats = client.get(f"/schedules/{schedule_id}/seats").json()["data"]["seats"]
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT price_per_seat FROM routes WHERE id = %s",
                (seed_route["id"],),
            )
            route = cur.fetchone()

    _state["schedule_id"] = schedule_id
    _state["travel_date"] = unique_travel_date
    _state["seat_id_by_number"] = {seat["seat_number"]: seat["seat_id"] for seat in seats}
    _state["next_seat"] = 1
    _state["price_per_seat"] = float(route["price_per_seat"])

    yield

    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM bookings WHERE schedule_instance_id = %s",
                (schedule_id,),
            )
            cur.execute("DELETE FROM schedule_instances WHERE id = %s", (schedule_id,))
            conn.commit()


# ---------------------------------------------------------------------------
# 1. API validation
# ---------------------------------------------------------------------------


def test_missing_message_is_422(client):
    resp = client.post("/agent/chat", json={})
    assert resp.status_code == 422


def test_empty_message_is_invalid_request(client):
    _assert_error(_chat(client, ""), "INVALID_REQUEST")


def test_whitespace_message_is_invalid_request(client):
    _assert_error(_chat(client, "   \n\t  "), "INVALID_REQUEST")


def test_message_longer_than_maximum_is_422(client):
    resp = _chat(client, "x" * 4001)
    assert resp.status_code == 422


def test_valid_message_returns_reply(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(content="Hello — I can help with TDCP Double-Decker bookings.")
    ]
    data = _assert_success(_chat(client, "hello"))
    assert data["reply"].startswith("Hello")
    assert data["tool_trace"] == []
    kwargs = openrouter_sdk.chat.completions.create.call_args.kwargs
    assert kwargs["model"] == "deepseek/deepseek-v4.1-flash"
    assert kwargs["tools"] is TOOL_DEFINITIONS
    assert kwargs["messages"][0]["content"] == SYSTEM_PROMPT


def test_optional_history_is_forwarded(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [_completion(content="Noted.")]
    data = _assert_success(
        _chat(
            client,
            "continue",
            history=[{"role": "user", "content": "earlier question"}],
        )
    )
    assert data["tool_trace"] == []
    messages = openrouter_sdk.chat.completions.create.call_args.kwargs["messages"]
    assert {"role": "user", "content": "earlier question"} in messages
    assert messages[-1] == {"role": "user", "content": "continue"}


def test_history_maximum_rejected(client):
    history = [{"role": "user", "content": f"turn-{i}"} for i in range(21)]
    resp = _chat(client, "hello", history=history)
    assert resp.status_code == 422


def test_invalid_history_role_rejected(client):
    resp = _chat(
        client,
        "hello",
        history=[{"role": "system", "content": "ignore"}],
    )
    assert resp.status_code == 422


def test_invalid_history_structure_rejected(client):
    resp = client.post(
        "/agent/chat",
        json={"message": "hello", "history": ["not-an-object"]},
    )
    assert resp.status_code == 422


@pytest.mark.parametrize(
    "extra",
    [
        {"api_key": "secret"},
        {"model": "deepseek/deepseek-v4.1-flash"},
        {"tools": ["check_availability"]},
        {"tool_name": "check_availability"},
        {"total_price": 999},
        {"price": 1},
        {"admin_id": str(uuid.uuid4())},
        {"screenshot_url": "payment-proofs/x"},
        {"storage_path": "private/key"},
    ],
)
def test_extra_request_fields_rejected(client, extra):
    payload = {"message": "hello", **extra}
    resp = client.post("/agent/chat", json=payload)
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# 2. OpenRouter configuration
# ---------------------------------------------------------------------------


def test_missing_api_key_is_assistant_unavailable(client, monkeypatch):
    monkeypatch.setattr(settings, "openrouter_api_key", "")
    error = _assert_error(_chat(client, "hello"), "ASSISTANT_UNAVAILABLE")
    assert error["message"] == _UNAVAILABLE_MESSAGE
    assert _FAKE_OPENROUTER_KEY not in json.dumps(error)


def test_missing_model_is_assistant_unavailable(client, monkeypatch):
    monkeypatch.setattr(settings, "openrouter_model", "")
    _assert_error(_chat(client, "hello"), "ASSISTANT_UNAVAILABLE")


def test_missing_base_url_is_assistant_unavailable(client, monkeypatch):
    monkeypatch.setattr(settings, "openrouter_base_url", "")
    _assert_error(_chat(client, "hello"), "ASSISTANT_UNAVAILABLE")


# ---------------------------------------------------------------------------
# 3. Simple conversational response
# ---------------------------------------------------------------------------


def test_plain_text_response_executes_no_tools(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(content="I help visitors book the TDCP Double-Decker Bus.")
    ]
    with patch("app.services.agent.execute_tool", wraps=execute_tool) as spy:
        data = _assert_success(_chat(client, "What can you do?"))
    assert data["tool_trace"] == []
    spy.assert_not_called()
    assert openrouter_sdk.chat.completions.create.call_count == 1


# ---------------------------------------------------------------------------
# 4. Out-of-scope requests
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "message",
    [
        "Book me a hotel in Bahawalpur",
        "Recommend a restaurant near the bus",
        "Plan a 7-day Pakistan itinerary",
        "Can I join the loyalty points program?",
        "List all pending payment proofs for admin review",
    ],
)
def test_out_of_scope_requests_do_not_execute_tools(client, openrouter_sdk, message):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            content=(
                "I can only help with TDCP Double-Decker Bus bookings, "
                "not that request."
            )
        )
    ]
    with patch("app.services.agent.execute_tool", wraps=execute_tool) as spy:
        data = _assert_success(_chat(client, message))
    assert data["tool_trace"] == []
    spy.assert_not_called()
    system = openrouter_sdk.chat.completions.create.call_args.kwargs["messages"][0]["content"]
    assert "hotel" in system.lower()


# ---------------------------------------------------------------------------
# 5. Availability tool
# ---------------------------------------------------------------------------


def test_check_availability_uses_list_schedules(client, openrouter_sdk):
    travel_date = _state["travel_date"].isoformat()
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    "avail1",
                    "check_availability",
                    json.dumps({"date": travel_date}),
                )
            ]
        ),
        _completion(content="I checked the live schedules for that date."),
    ]
    with patch(
        "app.services.agent_tools.list_schedules", wraps=real_list_schedules
    ) as spy:
        data = _assert_success(_chat(client, f"What buses are available on {travel_date}?"))

    spy.assert_called_once()
    assert spy.call_args.kwargs["travel_date"] == _state["travel_date"]
    assert data["tool_trace"] == [{"name": "check_availability", "ok": True}]

    tool_msgs = _tool_result_messages(openrouter_sdk.chat.completions.create, 1)
    assert tool_msgs[0]["tool_call_id"] == "avail1"
    result = json.loads(tool_msgs[0]["content"])
    assert result["ok"] is True
    assert result["data"]
    schedule = next(
        item
        for item in result["data"]
        if item["schedule_instance_id"] == _state["schedule_id"]
    )
    assert "price" not in schedule
    assert "total_price" not in schedule
    assert "available_seats" in schedule
    public = client.get(f"/schedules?date={travel_date}").json()["data"]
    public_match = next(
        item for item in public if item["schedule_instance_id"] == _state["schedule_id"]
    )
    assert schedule["available_seats"] == public_match["available_seats"]
    assert data["reply"] == "I checked the live schedules for that date."


def test_check_availability_invalid_date(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call("bad_date", "check_availability", json.dumps({"date": "not-a-date"}))
            ]
        ),
        _completion(content="Please provide a valid travel date."),
    ]
    with patch(
        "app.services.agent_tools.list_schedules", wraps=real_list_schedules
    ) as spy:
        data = _assert_success(_chat(client, "Any availability?"))
    spy.assert_not_called()
    assert data["tool_trace"] == [{"name": "check_availability", "ok": False}]
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert result["error"]["code"] == "INVALID_TOOL_ARGUMENTS"


# ---------------------------------------------------------------------------
# 6. Seat-map tool
# ---------------------------------------------------------------------------


def test_get_seat_map_uses_existing_service(client, openrouter_sdk):
    schedule_id = _state["schedule_id"]
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    "map1",
                    "get_seat_map",
                    json.dumps({"schedule_id": schedule_id}),
                )
            ]
        ),
        _completion(content="Here is the live seat map."),
    ]
    with patch("app.services.agent_tools.get_seat_map", wraps=real_get_seat_map) as spy:
        data = _assert_success(_chat(client, "Show me the seat map."))

    spy.assert_called_once()
    assert str(spy.call_args.kwargs["schedule_id"]) == schedule_id
    assert data["tool_trace"] == [{"name": "get_seat_map", "ok": True}]
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert result["ok"] is True
    seats = result["data"]["seats"]
    assert seats
    public = client.get(f"/schedules/{schedule_id}/seats").json()["data"]["seats"]
    assert {seat["seat_id"] for seat in seats} == {seat["seat_id"] for seat in public}


def test_get_seat_map_invalid_schedule_id(client, openrouter_sdk):
    missing = str(uuid.uuid4())
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call("map_missing", "get_seat_map", json.dumps({"schedule_id": missing}))
            ]
        ),
        _completion(content="That schedule was not found."),
    ]
    data = _assert_success(_chat(client, "Show seats for a fake schedule."))
    assert data["tool_trace"] == [{"name": "get_seat_map", "ok": False}]
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert result["error"]["code"] == "SCHEDULE_NOT_FOUND"


# ---------------------------------------------------------------------------
# 7. Hold tool
# ---------------------------------------------------------------------------


def test_create_booking_hold_uses_existing_service(client, openrouter_sdk):
    schedule_id = _state["schedule_id"]
    seat_id = _take_seat()
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    "hold1",
                    "create_booking_hold",
                    json.dumps({"schedule_id": schedule_id, "seat_ids": [seat_id]}),
                )
            ]
        ),
        _completion(content="Those seats are held."),
    ]
    with patch(
        "app.services.agent_tools.create_booking_hold", wraps=real_create_booking_hold
    ) as spy:
        data = _assert_success(_chat(client, "Hold that seat for me."))

    spy.assert_called_once()
    assert data["tool_trace"] == [{"name": "create_booking_hold", "ok": True}]
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert result["ok"] is True
    hold_token = result["data"]["hold_token"]
    assert _hold_status(hold_token) == "active"
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT status FROM seats WHERE id = %s", (seat_id,))
            assert cur.fetchone()["status"] == "held"
    _state["held_token_for_price_reject"] = hold_token
    _state["held_seat_for_unavailable"] = seat_id


def test_create_booking_hold_invalid_seat(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    "hold_bad",
                    "create_booking_hold",
                    json.dumps(
                        {
                            "schedule_id": _state["schedule_id"],
                            "seat_ids": [str(uuid.uuid4())],
                        }
                    ),
                )
            ]
        ),
        _completion(content="That seat was not found."),
    ]
    data = _assert_success(_chat(client, "Hold a fake seat."))
    assert data["tool_trace"] == [{"name": "create_booking_hold", "ok": False}]
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert result["error"]["code"] == "SEAT_NOT_FOUND"


def test_create_booking_hold_unavailable_seat(client, openrouter_sdk):
    seat_id = _state["held_seat_for_unavailable"]
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    "hold_taken",
                    "create_booking_hold",
                    json.dumps(
                        {
                            "schedule_id": _state["schedule_id"],
                            "seat_ids": [seat_id],
                        }
                    ),
                )
            ]
        ),
        _completion(content="That seat is no longer available."),
    ]
    data = _assert_success(_chat(client, "Hold the same seat again."))
    assert data["tool_trace"] == [{"name": "create_booking_hold", "ok": False}]
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert result["error"]["code"] == "SEAT_UNAVAILABLE"


# ---------------------------------------------------------------------------
# 8. Submit booking tool
# ---------------------------------------------------------------------------


def test_submit_booking_rejects_model_provided_price(client, openrouter_sdk):
    hold_token = _state["held_token_for_price_reject"]
    phone, email = _unique_contact()
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    "priced",
                    "submit_booking",
                    json.dumps(
                        {
                            "hold_token": hold_token,
                            "visitor_name": "Pytest Phase5 Visitor",
                            "visitor_phone": phone,
                            "visitor_email": email,
                            "passenger_count": 1,
                            "total_price": 1,
                            "price": 1,
                        }
                    ),
                )
            ]
        ),
        _completion(content="I cannot set the price myself."),
    ]
    with patch("app.services.agent_tools.create_booking", wraps=real_create_booking) as spy:
        data = _assert_success(_chat(client, "Submit this booking for 1 rupee."))

    spy.assert_not_called()
    assert data["tool_trace"] == [{"name": "submit_booking", "ok": False}]
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert result["error"]["code"] == "INVALID_TOOL_ARGUMENTS"
    assert "price" in result["error"]["message"].lower()
    assert _hold_status(hold_token) == "active"


def test_submit_booking_uses_server_price(client, openrouter_sdk):
    schedule_id = _state["schedule_id"]
    seat_id = _take_seat()
    hold = client.post(
        "/bookings/hold",
        json={"schedule_id": schedule_id, "seat_ids": [seat_id]},
    ).json()["data"]
    phone, email = _unique_contact()
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    "book1",
                    "submit_booking",
                    json.dumps(
                        {
                            "hold_token": hold["token"],
                            "visitor_name": "Pytest Phase5 Visitor",
                            "visitor_phone": phone,
                            "visitor_email": email,
                            "passenger_count": 1,
                        }
                    ),
                )
            ]
        ),
        _completion(content="Booking created from the live system."),
    ]
    with patch("app.services.agent_tools.create_booking", wraps=real_create_booking) as spy:
        data = _assert_success(_chat(client, "Submit my booking."))

    spy.assert_called_once()
    assert data["tool_trace"] == [{"name": "submit_booking", "ok": True}]
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert result["ok"] is True
    assert result["data"]["total_price"] == _state["price_per_seat"]
    row = _booking_row(result["data"]["booking_id"])
    assert float(row["total_price"]) == _state["price_per_seat"]
    _state["booking_ref"] = result["data"]["booking_ref"]
    _state["booking_phone"] = phone
    _state["booking_email"] = email
    _state["booking_id"] = result["data"]["booking_id"]


# ---------------------------------------------------------------------------
# 9. Hold → submit multi-step flow
# ---------------------------------------------------------------------------


def test_hold_then_submit_multi_step(client, openrouter_sdk):
    schedule_id = _state["schedule_id"]
    seat_id = _take_seat()
    phone, email = _unique_contact()
    calls: list[dict] = []

    def side_effect(*args, **kwargs):
        calls.append(kwargs)
        if len(calls) == 1:
            return _completion(
                tool_calls=[
                    _tool_call(
                        "ms_hold",
                        "create_booking_hold",
                        json.dumps({"schedule_id": schedule_id, "seat_ids": [seat_id]}),
                    )
                ]
            )
        if len(calls) == 2:
            result = json.loads(
                [item for item in kwargs["messages"] if item.get("role") == "tool"][-1]["content"]
            )
            assert result["ok"] is True
            return _completion(
                tool_calls=[
                    _tool_call(
                        "ms_book",
                        "submit_booking",
                        json.dumps(
                            {
                                "hold_token": result["data"]["hold_token"],
                                "visitor_name": "Pytest Phase5 Multi",
                                "visitor_phone": phone,
                                "visitor_email": email,
                                "passenger_count": 1,
                            }
                        ),
                    )
                ]
            )
        result = json.loads(
            [item for item in kwargs["messages"] if item.get("role") == "tool"][-1]["content"]
        )
        assert result["ok"] is True
        assert result["data"]["total_price"] == _state["price_per_seat"]
        return _completion(content="Hold converted into a booking.")

    openrouter_sdk.chat.completions.create.side_effect = side_effect
    with (
        patch("app.services.agent_tools.create_booking_hold", wraps=real_create_booking_hold) as hold_spy,
        patch("app.services.agent_tools.create_booking", wraps=real_create_booking) as book_spy,
    ):
        data = _assert_success(_chat(client, "Hold a seat and complete the booking."))

    hold_spy.assert_called_once()
    book_spy.assert_called_once()
    assert data["tool_trace"] == [
        {"name": "create_booking_hold", "ok": True},
        {"name": "submit_booking", "ok": True},
    ]
    first_tools = _tool_result_messages(openrouter_sdk.chat.completions.create, 1)
    second_tools = _tool_result_messages(openrouter_sdk.chat.completions.create, 2)
    assert first_tools[0]["tool_call_id"] == "ms_hold"
    assert second_tools[-1]["tool_call_id"] == "ms_book"
    booking = json.loads(second_tools[-1]["content"])["data"]
    row = _booking_row(booking["booking_id"])
    assert float(row["total_price"]) == _state["price_per_seat"]
    assert row["booking_status"] == "pending_payment"


# ---------------------------------------------------------------------------
# 10. Booking status
# ---------------------------------------------------------------------------


def test_get_booking_status_requires_exactly_one_identifier(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(tool_calls=[_tool_call("st0", "get_booking_status", "{}")]),
        _completion(content="I need a reference, phone, or email."),
    ]
    data = _assert_success(_chat(client, "What is my booking status?"))
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert data["tool_trace"] == [{"name": "get_booking_status", "ok": False}]
    assert result["error"]["code"] == "INVALID_LOOKUP"


def test_get_booking_status_rejects_multiple_identifiers(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    "st2",
                    "get_booking_status",
                    json.dumps({"ref": "TDCP-20990101-aaaaaaaa", "phone": "03000000000"}),
                )
            ]
        ),
        _completion(content="Please give only one lookup field."),
    ]
    data = _assert_success(_chat(client, "Look up this booking."))
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert data["tool_trace"] == [{"name": "get_booking_status", "ok": False}]
    assert result["error"]["code"] == "INVALID_LOOKUP"


def test_get_booking_status_unknown_ref_returns_empty_list(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    "st_miss",
                    "get_booking_status",
                    json.dumps({"ref": "TDCP-20990101-deadbeef"}),
                )
            ]
        ),
        _completion(content="No booking matched that reference."),
    ]
    with patch(
        "app.services.agent_tools.lookup_booking_status", wraps=real_lookup_booking_status
    ) as spy:
        data = _assert_success(_chat(client, "Status of booking TDCP-20990101-deadbeef?"))
    spy.assert_called_once()
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert data["tool_trace"] == [{"name": "get_booking_status", "ok": True}]
    assert result["data"] == []


@pytest.mark.parametrize(
    ("field", "state_key"),
    [("ref", "booking_ref"), ("phone", "booking_phone"), ("email", "booking_email")],
)
def test_get_booking_status_valid_lookups(client, openrouter_sdk, field, state_key):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    f"st_{field}",
                    "get_booking_status",
                    json.dumps({field: _state[state_key]}),
                )
            ]
        ),
        _completion(content="Here is the live booking status."),
    ]
    data = _assert_success(_chat(client, "Check my booking status."))
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert data["tool_trace"] == [{"name": "get_booking_status", "ok": True}]
    match = next(item for item in result["data"] if item["booking_ref"] == _state["booking_ref"])
    public = client.get("/bookings/status", params={field: _state[state_key]}).json()["data"]
    public_match = next(item for item in public if item["booking_ref"] == _state["booking_ref"])
    assert match["total_price"] == public_match["total_price"]
    assert match["status_message"] == public_match["status_message"]
    assert match["booking_status"] == public_match["booking_status"]


# ---------------------------------------------------------------------------
# 11. Multiple tool calls
# ---------------------------------------------------------------------------


def test_multiple_tool_calls_in_one_assistant_response(client, openrouter_sdk):
    travel_date = _state["travel_date"].isoformat()
    schedule_id = _state["schedule_id"]
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    "multi_avail",
                    "check_availability",
                    json.dumps({"date": travel_date}),
                ),
                _tool_call(
                    "multi_map",
                    "get_seat_map",
                    json.dumps({"schedule_id": schedule_id}),
                ),
            ]
        ),
        _completion(content="I checked both the schedule list and the seat map."),
    ]
    data = _assert_success(_chat(client, "Show availability and the seat map."))
    assert data["tool_trace"] == [
        {"name": "check_availability", "ok": True},
        {"name": "get_seat_map", "ok": True},
    ]
    tool_msgs = _tool_result_messages(openrouter_sdk.chat.completions.create, 1)
    assert [item["tool_call_id"] for item in tool_msgs] == ["multi_avail", "multi_map"]
    assert json.loads(tool_msgs[0]["content"])["ok"] is True
    assert json.loads(tool_msgs[1]["content"])["ok"] is True


# ---------------------------------------------------------------------------
# 12. Malformed / unknown tool calls
# ---------------------------------------------------------------------------


def test_malformed_json_arguments_are_safe(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[_tool_call("badjson", "check_availability", "{")]
        ),
        _completion(content="I could not read those tool arguments."),
    ]
    data = _assert_success(_chat(client, "Any availability?"))
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert data["tool_trace"] == [{"name": "check_availability", "ok": False}]
    assert result["error"]["code"] == "INVALID_TOOL_ARGUMENTS"
    _assert_no_leak(data | {"error": None})


def test_unknown_tool_name_does_not_crash(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[_tool_call("evil", "delete_admin_users", "{}")]
        ),
        _completion(content="That action is not available."),
    ]
    data = _assert_success(_chat(client, "Delete all admins."))
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert data["tool_trace"] == [{"name": "delete_admin_users", "ok": False}]
    assert result["error"]["code"] == "UNKNOWN_TOOL"


def test_missing_tool_call_id_still_round_trips(client, openrouter_sdk):
    travel_date = _state["travel_date"].isoformat()
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    None,
                    "check_availability",
                    json.dumps({"date": travel_date}),
                    include_id=False,
                )
            ]
        ),
        _completion(content="Looked up availability."),
    ]
    data = _assert_success(_chat(client, f"Availability on {travel_date}?"))
    assert data["tool_trace"] == [{"name": "check_availability", "ok": True}]
    tool_msgs = _tool_result_messages(openrouter_sdk.chat.completions.create, 1)
    assert tool_msgs[0]["tool_call_id"]


def test_missing_function_name_is_unknown_tool(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(tool_calls=[_tool_call("noname", "", "{}")]),
        _completion(content="I could not run that tool."),
    ]
    data = _assert_success(_chat(client, "Do something."))
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert data["tool_trace"] == [{"name": "unknown", "ok": False}]
    assert result["error"]["code"] == "UNKNOWN_TOOL"


def test_invalid_argument_types_are_safe(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call("badtype", "check_availability", json.dumps({"date": 20260920}))
            ]
        ),
        _completion(content="That date was not valid."),
    ]
    data = _assert_success(_chat(client, "Any availability?"))
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert data["tool_trace"] == [{"name": "check_availability", "ok": False}]
    assert result["error"]["code"] == "INVALID_TOOL_ARGUMENTS"


# ---------------------------------------------------------------------------
# 13. Grounding / hallucination protection
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "message",
    [
        "What buses are available tomorrow?",
        "How many seats are available?",
        "How much does the booking cost?",
        "What is the status of booking ABC123?",
    ],
)
def test_ungrounded_operational_answer_is_replaced(client, openrouter_sdk, message):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(content="There are 12 seats available tomorrow for 250 rupees. Booking ABC123 is confirmed.")
    ]
    with patch("app.services.agent.execute_tool", wraps=execute_tool) as spy:
        data = _assert_success(_chat(client, message))
    spy.assert_not_called()
    assert data["tool_trace"] == []
    assert data["reply"] == _UNGROUNDED_FALLBACK
    assert "12 seats" not in data["reply"]
    assert "250" not in data["reply"]


def test_grounded_availability_uses_real_tool_result(client, openrouter_sdk):
    travel_date = _state["travel_date"].isoformat()
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    "grounded",
                    "check_availability",
                    json.dumps({"date": travel_date}),
                )
            ]
        ),
        _completion(content="Live availability is shown from the tool result."),
    ]
    data = _assert_success(_chat(client, "How many seats are available?"))
    assert data["tool_trace"] == [{"name": "check_availability", "ok": True}]
    assert data["reply"] != _UNGROUNDED_FALLBACK
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    assert result["ok"] is True
    assert any(
        item["schedule_instance_id"] == _state["schedule_id"] for item in result["data"]
    )


# ---------------------------------------------------------------------------
# 14. History
# ---------------------------------------------------------------------------


def test_valid_history_is_not_authoritative_without_tools(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(content="Yes, 12 seats are still available as I said earlier.")
    ]
    data = _assert_success(
        _chat(
            client,
            "How many seats are available?",
            history=[
                {
                    "role": "assistant",
                    "content": "There are 12 seats available tomorrow.",
                }
            ],
        )
    )
    assert data["tool_trace"] == []
    assert data["reply"] == _UNGROUNDED_FALLBACK


def test_live_tool_result_overrides_stale_history(client, openrouter_sdk):
    travel_date = _state["travel_date"].isoformat()
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    "fresh",
                    "check_availability",
                    json.dumps({"date": travel_date}),
                )
            ]
        ),
        _completion(content="I used the live schedule list, not the earlier chat."),
    ]
    data = _assert_success(
        _chat(
            client,
            f"What buses are available on {travel_date}?",
            history=[
                {
                    "role": "assistant",
                    "content": "There are no buses tomorrow and every seat is taken.",
                }
            ],
        )
    )
    assert data["tool_trace"] == [{"name": "check_availability", "ok": True}]
    result = json.loads(_tool_result_messages(openrouter_sdk.chat.completions.create, 1)[0]["content"])
    match = next(
        item
        for item in result["data"]
        if item["schedule_instance_id"] == _state["schedule_id"]
    )
    assert match["available_seats"] > 0


def test_service_history_cap_keeps_last_twenty(openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [_completion(content="ok")]
    history = [{"role": "user", "content": f"msg-{i}"} for i in range(25)]
    result = run_chat("latest", history=history)
    assert result["reply"] == "ok"
    sent = openrouter_sdk.chat.completions.create.call_args.kwargs["messages"]
    kept = [item for item in sent if item["role"] == "user" and item["content"].startswith("msg-")]
    assert len(kept) == 20
    assert kept[0]["content"] == "msg-5"
    assert sent[-1]["content"] == "latest"


# ---------------------------------------------------------------------------
# 15. Provider failure
# ---------------------------------------------------------------------------


def test_provider_failure_is_assistant_unavailable(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = OpenAIError(
        "upstream exploded with secret-key-should-not-leak"
    )
    error = _assert_error(_chat(client, "hello"), "ASSISTANT_UNAVAILABLE")
    blob = json.dumps(error)
    assert "secret-key-should-not-leak" not in blob
    assert "OpenAIError" not in blob
    assert _FAKE_OPENROUTER_KEY not in blob


# ---------------------------------------------------------------------------
# 16. Loop limit
# ---------------------------------------------------------------------------


def test_loop_limit_stops_after_six_model_calls(client, openrouter_sdk):
    travel_date = _state["travel_date"].isoformat()
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    f"loop{i}",
                    "check_availability",
                    json.dumps({"date": travel_date}),
                )
            ]
        )
        for i in range(6)
    ]
    with patch("app.services.agent.execute_tool", wraps=execute_tool) as spy:
        data = _assert_success(_chat(client, f"What buses are available on {travel_date}?"))
    assert openrouter_sdk.chat.completions.create.call_count == 6
    assert spy.call_count == 5
    assert data["tool_trace"] == [{"name": "check_availability", "ok": True}] * 5
    assert data["reply"] == "I could not complete that request just now. Please try again."


# ---------------------------------------------------------------------------
# 17. Security / data exposure
# ---------------------------------------------------------------------------


def test_responses_do_not_expose_secrets_or_admin_data(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(content="Welcome.")
    ]
    resp = _chat(client, "hello")
    body = resp.json()
    _assert_no_leak(body)
    assert "choices" not in body
    assert "tool_calls" not in (body.get("data") or {})


# ---------------------------------------------------------------------------
# 18. API contract
# ---------------------------------------------------------------------------


def test_success_envelope_shape(client, openrouter_sdk):
    openrouter_sdk.chat.completions.create.side_effect = [
        _completion(
            tool_calls=[
                _tool_call(
                    "contract",
                    "check_availability",
                    json.dumps({"date": _state["travel_date"].isoformat()}),
                )
            ]
        ),
        _completion(content="Checked."),
    ]
    resp = _chat(client, "Any availability?")
    body = resp.json()
    assert resp.status_code == 200
    assert body["error"] is None
    assert body["data"]["reply"] == "Checked."
    assert body["data"]["tool_trace"] == [{"name": "check_availability", "ok": True}]
    _assert_no_leak(body)


def test_error_envelope_for_unavailable_assistant(client, monkeypatch):
    monkeypatch.setattr(settings, "openrouter_api_key", "")
    resp = _chat(client, "hello")
    body = resp.json()
    assert resp.status_code == 200
    assert body == {
        "data": None,
        "error": {
            "code": "ASSISTANT_UNAVAILABLE",
            "message": _UNAVAILABLE_MESSAGE,
            "details": None,
        },
    }
