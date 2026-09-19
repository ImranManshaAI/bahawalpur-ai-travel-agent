"""Hybrid assistant controller in front of the existing Phase 5 OpenRouter loop.

Decides STATIC_FAQ, DATABASE, TRANSACTIONAL, OUT_OF_SCOPE, or UNCERTAIN.
Does not invent operational facts. Transactional and uncertain messages
still use ``run_chat``.
"""
from __future__ import annotations

import re
from decimal import Decimal
from typing import Any

from app.services.agent import run_chat
from app.services.agent_faq import match_faq
from app.services.routes import list_active_routes

STATIC_FAQ = "STATIC_FAQ"
DATABASE = "DATABASE"
TRANSACTIONAL = "TRANSACTIONAL"
OUT_OF_SCOPE = "OUT_OF_SCOPE"
UNCERTAIN = "UNCERTAIN"

_OUT_OF_SCOPE_RE = re.compile(
    r"\b("
    r"hotels?|restaurants?|airbnb|"
    r"loyalty( points| program)?|"
    r"itinerary|travel planner|destination discovery|"
    r"pakistan trip|whole (pakistan )?trip|"
    r"unrelated events?|"
    r"pending payment proofs|admin review|admin panel"
    r")\b",
    re.I,
)

_TRANSACTIONAL_RE = re.compile(
    r"\b("
    r"available|availability|"
    r"tomorrow|tonight|today|this (friday|saturday|sunday|weekend)|"
    r"\d{4}-\d{2}-\d{2}|"
    r"seat[\s-]?map|which seats|upper[- ]deck|lower[- ]deck|"
    r"\b[ul]\d{2}\b|"
    r"hold (me |these |the )?(seat|seats|u\d)|"
    r"reserve (these |the )?(two )?seats|"
    r"i want (seats?|three seats|two seats)|"
    r"book me|submit (the |my )?booking|"
    r"booking status|payment (been )?verif|"
    r"status of (the |my )?booking|booking [a-z0-9-]+|"
    r"has my payment|is (my )?booking confirmed|"
    r"what seats did i book|"
    r"routes? (are )?available|available (on |for )|"
    r"timings? (are )?available|is route .+ available|"
    r"how many seats|are seats|show (me )?(the )?seats"
    r")\b",
    re.I,
)

_ROUTE_CATALOG_RE = re.compile(
    r"what routes|which routes|routes do you (offer|have|operate|run)|"
    r"list (the |your )?routes|what (tours|routes) (do you offer|are there)",
    re.I,
)

_ROUTE_PRICE_RE = re.compile(
    r"how much|what('s| is) the (price|fare|cost)|"
    r"price of|cost of|fare (for|of)",
    re.I,
)

_OUT_OF_SCOPE_REPLY = (
    "I can only help with the TDCP Double-Decker Bus booking service in "
    "Bahawalpur — schedules, seats, holds, bookings, and booking status. "
    "I cannot help with hotels, restaurants, other tours, or general travel planning."
)


def handle_chat(
    message: str,
    history: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    category = classify(message)

    if category == STATIC_FAQ:
        answer = match_faq(message)
        if answer:
            return {"reply": answer, "tool_trace": []}
        return run_chat(message, history)

    if category == OUT_OF_SCOPE:
        return {"reply": _OUT_OF_SCOPE_REPLY, "tool_trace": []}

    if category == DATABASE:
        return _database_reply(message)

    return run_chat(message, history)


def classify(message: str) -> str:
    text = (message or "").strip()
    if not text:
        return UNCERTAIN

    if _OUT_OF_SCOPE_RE.search(text):
        return OUT_OF_SCOPE

    if match_faq(text):
        return STATIC_FAQ

    if _TRANSACTIONAL_RE.search(text):
        return TRANSACTIONAL

    if _ROUTE_CATALOG_RE.search(text):
        return DATABASE

    if _ROUTE_PRICE_RE.search(text) or re.search(r"\broute\b|tell me about", text, re.I):
        if _match_named_route(text) is not None:
            return DATABASE

    return UNCERTAIN


def _match_named_route(message: str) -> dict | None:
    text = message.lower()
    routes = list_active_routes()
    matches = []
    for route in routes:
        name = route["name"].lower()
        if re.search(r"(?<![\w])" + re.escape(name) + r"(?![\w])", text):
            matches.append(route)
    if len(matches) == 1:
        return matches[0]
    return None


def _format_price(route: dict) -> str:
    if route["pricing_model"] == "per_seat" and route["price_per_seat"] is not None:
        amount = _money(route["price_per_seat"])
        return f"Rs. {amount} per seat"
    if route["pricing_model"] == "flat_rate" and route["flat_price"] is not None:
        amount = _money(route["flat_price"])
        return f"Rs. {amount} for the whole bus"
    return "pricing is not configured for this route"


def _money(value: Any) -> str:
    if isinstance(value, Decimal):
        quantized = value.quantize(Decimal("0.01"))
        if quantized == quantized.to_integral():
            return str(int(quantized))
        return format(quantized, "f")
    return str(value)


def _database_reply(message: str) -> dict[str, Any]:
    routes = list_active_routes()
    named = _match_named_route(message)

    if named is not None and _ROUTE_PRICE_RE.search(message):
        return {
            "reply": f"{named['name']} costs {_format_price(named)}.",
            "tool_trace": [],
        }

    if named is not None:
        description = (named.get("description") or "").strip()
        extra = f" {description}" if description else ""
        return {
            "reply": (
                f"{named['name']} is an active TDCP Double-Decker route.{extra} "
                f"The configured fare is {_format_price(named)}."
            ).strip(),
            "tool_trace": [],
        }

    if not routes:
        return {
            "reply": "There are no active Double-Decker routes configured right now.",
            "tool_trace": [],
        }

    lines = ["TDCP currently offers these Double-Decker routes:"]
    for route in routes:
        lines.append(f"- {route['name']}: {_format_price(route)}")
    return {"reply": "\n".join(lines), "tool_trace": []}
