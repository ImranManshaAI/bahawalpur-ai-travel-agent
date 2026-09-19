"""Hybrid assistant routing tests.

OpenRouter is mocked at the SDK boundary. Route catalog/pricing reads use
the real routes table. FAQ and out-of-scope paths must not call OpenRouter.
"""
from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

import pytest
from psycopg.rows import dict_row

from app.core.config import settings
from app.core.database import pool
from app.services.agent import _UNGROUNDED_FALLBACK
from app.services.agent_hybrid import (
    DATABASE,
    OUT_OF_SCOPE,
    STATIC_FAQ,
    TRANSACTIONAL,
    UNCERTAIN,
    classify,
)
from app.services.agent_tools import execute_tool
from app.services.routes import list_active_routes


def _chat(client, message, history=None):
    payload = {"message": message}
    if history is not None:
        payload["history"] = history
    return client.post("/agent/chat", json=payload)


def _assert_success(resp) -> dict:
    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None
    assert set(body["data"].keys()) == {"reply", "tool_trace"}
    return body["data"]


def _active_routes() -> list[dict]:
    return list_active_routes()


@pytest.fixture(autouse=True)
def openrouter_sdk(monkeypatch):
    monkeypatch.setattr(settings, "openrouter_api_key", "test-openrouter-key")
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


# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------


def test_classify_faq_booking_process():
    assert classify("How does booking work?") == STATIC_FAQ
    assert classify("How do I book a seat?") == STATIC_FAQ
    assert classify("How does the seat hold work?") == STATIC_FAQ
    assert classify("What happens when a hold expires?") == STATIC_FAQ
    assert classify("What happens after I upload payment proof?") == STATIC_FAQ
    assert classify("What does pending verification mean?") == STATIC_FAQ
    assert classify("How can I check my booking?") == STATIC_FAQ
    assert classify("What information is required for booking?") == STATIC_FAQ
    assert classify("How does payment verification work?") == STATIC_FAQ
    assert classify("What happens if payment is rejected?") == STATIC_FAQ


def test_classify_out_of_scope():
    assert classify("Find me a hotel in Bahawalpur.") == OUT_OF_SCOPE
    assert classify("Recommend a restaurant.") == OUT_OF_SCOPE
    assert classify("Plan my whole Pakistan trip.") == OUT_OF_SCOPE


def test_classify_transactional_live_data():
    assert classify("What routes are available tomorrow?") == TRANSACTIONAL
    assert classify("Are seats available tomorrow?") == TRANSACTIONAL
    assert classify("Show me the seats.") == TRANSACTIONAL
    assert classify("Is U05 available?") == TRANSACTIONAL
    assert classify("Hold U05 for me.") == TRANSACTIONAL
    assert classify("What's my booking status?") == TRANSACTIONAL
    assert classify("Has my payment been verified?") == TRANSACTIONAL


def test_classify_route_catalog_is_database_not_availability():
    assert classify("What routes do you offer?") == DATABASE


def test_classify_greeting_is_uncertain():
    assert classify("Hello") == UNCERTAIN
    assert classify("What can you do?") == UNCERTAIN


# ---------------------------------------------------------------------------
# Static FAQ
# ---------------------------------------------------------------------------


def test_faq_booking_work_does_not_call_openrouter(client, openrouter_sdk):
    with patch("app.services.agent.execute_tool", wraps=execute_tool) as spy:
        data = _assert_success(_chat(client, "How does booking work?"))
    openrouter_sdk.chat.completions.create.assert_not_called()
    spy.assert_not_called()
    assert data["tool_trace"] == []
    assert "choose a travel date" in data["reply"].lower()
    assert "300" not in data["reply"]
    assert "available_seats" not in data["reply"]


def test_faq_payment_verification_does_not_call_openrouter(client, openrouter_sdk):
    data = _assert_success(_chat(client, "How does payment verification work?"))
    openrouter_sdk.chat.completions.create.assert_not_called()
    assert data["tool_trace"] == []
    assert "screenshot" in data["reply"].lower() or "proof" in data["reply"].lower()


def test_faq_seat_hold_does_not_call_openrouter(client, openrouter_sdk):
    data = _assert_success(_chat(client, "How does the seat hold work?"))
    openrouter_sdk.chat.completions.create.assert_not_called()
    assert data["tool_trace"] == []
    assert "temporary" in data["reply"].lower()
    assert "expire" in data["reply"].lower()


# ---------------------------------------------------------------------------
# Database-backed catalog / pricing
# ---------------------------------------------------------------------------


def test_route_catalog_uses_database_not_hardcoded_list(client, openrouter_sdk):
    routes = _active_routes()
    assert routes, "Test database must have at least one active route."

    with patch("app.services.agent_hybrid.list_active_routes", wraps=list_active_routes) as spy:
        data = _assert_success(_chat(client, "What routes do you offer?"))

    spy.assert_called()
    openrouter_sdk.chat.completions.create.assert_not_called()
    assert data["tool_trace"] == []
    reply = data["reply"]
    for route in routes:
        assert route["name"] in reply


def test_named_route_price_comes_from_database(client, openrouter_sdk):
    routes = _active_routes()
    assert routes, "Test database must have at least one active route."
    route = routes[0]
    data = _assert_success(_chat(client, f"How much is {route['name']}?"))
    openrouter_sdk.chat.completions.create.assert_not_called()
    assert data["tool_trace"] == []
    from app.services.agent_hybrid import _format_price

    assert route["name"] in data["reply"]
    assert _format_price(route) in data["reply"]


def test_route_catalog_is_not_confused_with_availability(client, openrouter_sdk):
    from types import SimpleNamespace

    openrouter_sdk.chat.completions.create.side_effect = [
        SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(
                        content=None,
                        tool_calls=[
                            SimpleNamespace(
                                id="avail",
                                type="function",
                                function=SimpleNamespace(
                                    name="check_availability",
                                    arguments='{"date":"2026-12-01"}',
                                ),
                            )
                        ],
                    )
                )
            ]
        ),
        SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(
                        content="I checked live availability.",
                        tool_calls=None,
                    )
                )
            ]
        ),
    ]
    data = _assert_success(_chat(client, "What routes are available on 2026-12-01?"))
    assert data["tool_trace"] == [{"name": "check_availability", "ok": True}]
    assert openrouter_sdk.chat.completions.create.call_count == 2


# ---------------------------------------------------------------------------
# Transactional / LLM path
# ---------------------------------------------------------------------------


def test_availability_question_uses_existing_tool_path(client, openrouter_sdk):
    from types import SimpleNamespace

    openrouter_sdk.chat.completions.create.side_effect = [
        SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(
                        content=None,
                        tool_calls=[
                            SimpleNamespace(
                                id="t1",
                                type="function",
                                function=SimpleNamespace(
                                    name="check_availability",
                                    arguments='{"date":"2026-12-02"}',
                                ),
                            )
                        ],
                    )
                )
            ]
        ),
        SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(content="Live seats checked.", tool_calls=None)
                )
            ]
        ),
    ]
    data = _assert_success(_chat(client, "Are seats available tomorrow?"))
    assert data["tool_trace"] == [{"name": "check_availability", "ok": True}]


def test_seat_question_without_schedule_stays_on_llm_path(client, openrouter_sdk):
    from types import SimpleNamespace

    openrouter_sdk.chat.completions.create.side_effect = [
        SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(
                        content="Which date and timing should I use for the seat map?",
                        tool_calls=None,
                    )
                )
            ]
        )
    ]
    data = _assert_success(_chat(client, "Show me the seats."))
    assert openrouter_sdk.chat.completions.create.call_count == 1
    assert data["reply"] == _UNGROUNDED_FALLBACK
    assert data["tool_trace"] == []


def test_status_question_uses_llm_path(client, openrouter_sdk):
    from types import SimpleNamespace

    openrouter_sdk.chat.completions.create.side_effect = [
        SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(
                        content=None,
                        tool_calls=[
                            SimpleNamespace(
                                id="st",
                                type="function",
                                function=SimpleNamespace(
                                    name="get_booking_status",
                                    arguments=json.dumps({"ref": "TDCP-20990101-deadbeef"}),
                                ),
                            )
                        ],
                    )
                )
            ]
        ),
        SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(content="No matching booking.", tool_calls=None)
                )
            ]
        ),
    ]
    data = _assert_success(_chat(client, "What's my booking status?"))
    assert data["tool_trace"] == [{"name": "get_booking_status", "ok": True}]


# ---------------------------------------------------------------------------
# Out of scope
# ---------------------------------------------------------------------------


def test_hotel_request_is_deterministic_out_of_scope(client, openrouter_sdk):
    data = _assert_success(_chat(client, "Find me a hotel in Bahawalpur."))
    openrouter_sdk.chat.completions.create.assert_not_called()
    assert data["tool_trace"] == []
    assert "hotel" in data["reply"].lower() or "double-decker" in data["reply"].lower()


def test_restaurant_request_is_deterministic_out_of_scope(client, openrouter_sdk):
    data = _assert_success(_chat(client, "Recommend a restaurant."))
    openrouter_sdk.chat.completions.create.assert_not_called()
    assert data["tool_trace"] == []


def test_generic_trip_planning_is_deterministic_out_of_scope(client, openrouter_sdk):
    data = _assert_success(_chat(client, "Plan my whole Pakistan trip."))
    openrouter_sdk.chat.completions.create.assert_not_called()
    assert data["tool_trace"] == []


# ---------------------------------------------------------------------------
# Safety
# ---------------------------------------------------------------------------


def test_faq_does_not_contain_live_or_price_constants():
    from app.services.agent_faq import _FAQ_ENTRIES

    combined = " ".join(answer for _pattern, answer in _FAQ_ENTRIES)
    assert "Rs." not in combined
    assert "300" not in combined
    assert "30000" not in combined
    assert "U05" not in combined


def test_catalog_prices_match_database_rows():
    routes = _active_routes()
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT name, pricing_model, price_per_seat, flat_price "
                "FROM routes WHERE status = 'active' ORDER BY name"
            )
            db_rows = cur.fetchall()
    assert [(row["name"], row["pricing_model"]) for row in routes] == [
        (row["name"], row["pricing_model"]) for row in db_rows
    ]
