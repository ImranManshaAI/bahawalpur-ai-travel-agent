"""Phase 5 OpenRouter tool-calling loop.

Consumes ``TOOL_DEFINITIONS`` and ``execute_tool`` from the existing tool
registry. No HTTP route, no conversation table, no extra tools.
"""
from __future__ import annotations

import json
import re
from typing import Any

from openai import OpenAI, OpenAIError

from app.core.config import settings
from app.services.agent_tools import TOOL_DEFINITIONS, execute_tool

_MAX_LOOP_ITERATIONS = 6
_MAX_HISTORY_MESSAGES = 20
_MAX_MESSAGE_CHARS = 4000

_UNAVAILABLE_MESSAGE = "The travel assistant is temporarily unavailable."
_LOOP_LIMIT_REPLY = "I could not complete that request just now. Please try again."
_UNGROUNDED_FALLBACK = (
    "I have to check the live booking system before I can answer that. "
    "Please ask again so I can look up the current information."
)

_LIVE_FACT_RE = re.compile(
    r"\b("
    r"available|availability|"
    r"seats?|seat[\s-]?map|"
    r"prices?|pricing|fare|cost|rupees?|pkr|how\s+much|"
    r"schedule|timings?|"
    r"booking\s+(status|ref|reference)|"
    r"status\s+of\s+(the\s+)?booking|"
    r"payment\s+status|"
    r"hold(\s+seats?)?"
    r")\b",
    re.IGNORECASE,
)

SYSTEM_PROMPT = """\
You are the Bahawalpur AI Travel Agent for the TDCP Double-Decker Bus \
Booking & Reservation System.

You help visitors book TDCP Double-Decker Bus trips in Bahawalpur: general \
questions about this tour/route, checking live availability, showing live \
seat availability, placing a temporary seat hold, submitting a booking from \
a valid hold, and looking up an existing booking's status.

You are not a general tourism marketplace or travel planner. You must not \
book hotels, recommend restaurants, sell other tour products, run loyalty \
programs, perform admin operations, or access payment-proof storage. If \
asked to do those things, refuse briefly and redirect to Double-Decker Bus \
booking. Visitors upload payment proof on the website, not through this \
assistant.

CRITICAL GROUNDING RULES:
- Never invent availability, seats, prices, booking references, booking \
status, payment status, or schedule information.
- Operational facts must come from a tool result in this conversation turn. \
Do not treat prior chat history as live operational data.
- This prompt contains no live availability, seats, prices, bookings, or \
payments. Do not fill those gaps from memory.

TOOL USAGE:
- check_availability — live open schedules and seat counts for a travel date. \
It does not return prices.
- get_seat_map — live seat map (id, number, deck, status) for one schedule.
- create_booking_hold — temporarily hold selected seats (use seat ids from \
get_seat_map).
- submit_booking — create a booking from a valid hold_token. The server \
calculates the total; never invent or supply a price.
- get_booking_status — look up booking(s) by exactly one of ref, phone, or email.

PRICING:
- Never calculate an authoritative total yourself.
- Do not quote a fare unless submit_booking or get_booking_status actually \
returned that total_price. Then quote that exact returned value only.
- If the visitor asks for a price and no such tool result exists, say you \
need to check the live system rather than estimating.

If a tool returns an error, explain it in plain language without exposing \
internal or technical details.
"""


class AssistantUnavailableError(Exception):
    """OpenRouter is not configured or did not return a usable response."""


def run_chat(
    message: str,
    history: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Run one OpenRouter tool-calling turn.

    Returns ``{"reply": str, "tool_trace": list}``. ``tool_trace`` lists
    actual ``execute_tool()`` calls only. Raises
    ``AssistantUnavailableError`` when the assistant cannot be used.
    """
    text = (message or "").strip()
    if not text:
        raise ValueError("A message is required.")
    if len(text) > _MAX_MESSAGE_CHARS:
        text = text[:_MAX_MESSAGE_CHARS]

    client = _build_client()
    messages: list[dict[str, Any]] = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *_sanitize_history(history),
        {"role": "user", "content": text},
    ]
    tool_trace: list[dict[str, Any]] = []

    for step in range(_MAX_LOOP_ITERATIONS):
        assistant = _complete(client, messages)
        tool_calls = _function_tool_calls(assistant)

        if tool_calls:
            if step == _MAX_LOOP_ITERATIONS - 1:
                return {"reply": _LOOP_LIMIT_REPLY, "tool_trace": tool_trace}

            messages.append(_assistant_tool_call_message(assistant, tool_calls))
            for call in tool_calls:
                result = execute_tool(call["name"], call["arguments"])
                tool_trace.append(
                    {
                        "name": call["name"] or "unknown",
                        "ok": bool(result.get("ok")),
                    }
                )
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": call["id"],
                        "content": json.dumps(result),
                    }
                )
            continue

        reply = (assistant.content or "").strip()
        if not reply:
            raise AssistantUnavailableError(_UNAVAILABLE_MESSAGE)
        if not tool_trace and _asks_for_live_facts(text):
            reply = _UNGROUNDED_FALLBACK
        return {"reply": reply, "tool_trace": tool_trace}

    return {"reply": _LOOP_LIMIT_REPLY, "tool_trace": tool_trace}


def _build_client() -> OpenAI:
    api_key = (settings.openrouter_api_key or "").strip()
    model = (settings.openrouter_model or "").strip()
    base_url = (settings.openrouter_base_url or "").strip()
    if not api_key or not model or not base_url:
        raise AssistantUnavailableError(_UNAVAILABLE_MESSAGE)

    return OpenAI(api_key=api_key, base_url=base_url)


def _complete(client: OpenAI, messages: list[dict[str, Any]]) -> Any:
    try:
        completion = client.chat.completions.create(
            model=settings.openrouter_model.strip(),
            messages=messages,
            tools=TOOL_DEFINITIONS,
        )
    except OpenAIError as exc:
        raise AssistantUnavailableError(_UNAVAILABLE_MESSAGE) from exc

    choices = getattr(completion, "choices", None) or []
    if not choices:
        raise AssistantUnavailableError(_UNAVAILABLE_MESSAGE)

    message = getattr(choices[0], "message", None)
    if message is None:
        raise AssistantUnavailableError(_UNAVAILABLE_MESSAGE)
    return message


def _function_tool_calls(assistant: Any) -> list[dict[str, str]]:
    raw_calls = getattr(assistant, "tool_calls", None) or []
    parsed: list[dict[str, str]] = []
    for index, tool_call in enumerate(raw_calls):
        function = getattr(tool_call, "function", None)
        if function is None and isinstance(tool_call, dict):
            function = tool_call.get("function")
            call_id = tool_call.get("id") or f"tool_call_{index}"
            if isinstance(function, dict):
                arguments = function.get("arguments") or "{}"
                parsed.append(
                    {
                        "id": str(call_id),
                        "name": str(function.get("name") or ""),
                        "arguments": arguments if isinstance(arguments, str) else json.dumps(arguments),
                    }
                )
            continue

        if function is None:
            continue

        call_id = getattr(tool_call, "id", None) or f"tool_call_{index}"
        arguments = getattr(function, "arguments", None) or "{}"
        parsed.append(
            {
                "id": str(call_id),
                "name": str(getattr(function, "name", None) or ""),
                "arguments": arguments if isinstance(arguments, str) else json.dumps(arguments),
            }
        )
    return parsed


def _assistant_tool_call_message(
    assistant: Any,
    tool_calls: list[dict[str, str]],
) -> dict[str, Any]:
    return {
        "role": "assistant",
        "content": assistant.content or None,
        "tool_calls": [
            {
                "id": call["id"],
                "type": "function",
                "function": {
                    "name": call["name"],
                    "arguments": call["arguments"],
                },
            }
            for call in tool_calls
        ],
    }


def _sanitize_history(history: list[dict[str, Any]] | None) -> list[dict[str, str]]:
    if not history:
        return []

    cleaned: list[dict[str, str]] = []
    for item in history:
        if not isinstance(item, dict):
            continue
        role = item.get("role")
        content = item.get("content")
        if role not in ("user", "assistant"):
            continue
        if not isinstance(content, str):
            continue
        content = content.strip()
        if not content:
            continue
        if len(content) > _MAX_MESSAGE_CHARS:
            content = content[:_MAX_MESSAGE_CHARS]
        cleaned.append({"role": role, "content": content})

    return cleaned[-_MAX_HISTORY_MESSAGES:]


def _asks_for_live_facts(message: str) -> bool:
    return _LIVE_FACT_RE.search(message) is not None
