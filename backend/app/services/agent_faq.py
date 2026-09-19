"""Static FAQ for stable TDCP Double-Decker booking process information.

Contains no live availability, seat counts, prices, booking status, or
payment status. Those must come from backend services.
"""
from __future__ import annotations

import re

# Process answers follow SDD Sections 3–4.6. No live inventory or fares.
_FAQ_ENTRIES: tuple[tuple[re.Pattern[str], str], ...] = (
    (
        re.compile(
            r"how (do i|does|can i) book|how does booking work|how do i book a seat",
            re.I,
        ),
        "To book a TDCP Double-Decker Bus seat: choose a travel date, pick an "
        "open timing for that date, select seats on the live upper/lower deck "
        "map, enter your name, phone, email if needed, and passenger count, "
        "then submit the booking. The server calculates the total. You pay "
        "TDCP manually outside this system, upload a payment screenshot, and "
        "wait for staff to verify it. A booking is confirmed only after that "
        "verification.",
    ),
    (
        re.compile(
            r"what information is required|what (details|info) (do i|are) (need|required)",
            re.I,
        ),
        "A booking needs your name, phone number, email if needed, passenger "
        "count, the selected seats, and the date and timing. Nothing beyond "
        "that is required to complete the reservation.",
    ),
    (
        re.compile(
            r"how does (the )?(temporary )?seat hold work|how do (temporary )?holds work|"
            r"what is a (temporary )?seat hold",
            re.I,
        ),
        "When you select seats, the system places a temporary hold so no one "
        "else can take them while you finish. The hold is tied to that booking "
        "session. If you do not complete the booking before the hold expires, "
        "the seats are released back to available.",
    ),
    (
        re.compile(
            r"what happens when (a |the )?hold expires|if (the |my )?hold expires",
            re.I,
        ),
        "When a hold expires without a completed booking, those seats return "
        "to available and can be selected by someone else. Start the seat "
        "selection again if you still want to book.",
    ),
    (
        re.compile(
            r"what happens after (i )?upload( payment)? proof|after (i )?upload|"
            r"what happens after payment proof",
            re.I,
        ),
        "After you upload a payment screenshot, the payment is marked pending "
        "verification. TDCP staff compare the proof with the payment they "
        "received, then confirm or reject it. Before verification you can "
        "look up the booking and see: Payment proof submitted — awaiting "
        "verification.",
    ),
    (
        re.compile(
            r"what does pending verification mean|pending verification",
            re.I,
        ),
        "Pending verification means your payment proof was received and is "
        "waiting for TDCP staff to review it. The booking is not confirmed "
        "until they accept the proof.",
    ),
    (
        re.compile(
            r"how (can|do) i check (my )?booking|how (can|do) i (look up|lookup) (a |my )?booking",
            re.I,
        ),
        "You can look up a booking by booking reference, phone, or email. "
        "The lookup shows date, timing, seats, the server-calculated amount, "
        "payment status, and booking status.",
    ),
    (
        re.compile(
            r"how does payment verification work|how (is|does) payment (verified|verification)",
            re.I,
        ),
        "You pay TDCP's shown account (bank, JazzCash, or Easypaisa) outside "
        "this system, then upload a screenshot. Staff review the proof. "
        "Confirming payment is one all-or-nothing step: the payment, the "
        "booking, and the seats are finalized together. If that step cannot "
        "complete, none of it applies.",
    ),
    (
        re.compile(
            r"what happens if payment is rejected|if (my )?payment is rejected|"
            r"what if (the )?payment is rejected",
            re.I,
        ),
        "If payment is rejected, the booking stays unconfirmed and the held "
        "seats are released back to available. Contact TDCP if you need "
        "details about a rejected payment.",
    ),
)


def match_faq(message: str) -> str | None:
    text = (message or "").strip()
    if not text:
        return None
    for pattern, answer in _FAQ_ENTRIES:
        if pattern.search(text):
            return answer
    return None
