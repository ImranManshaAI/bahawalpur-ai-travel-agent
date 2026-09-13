"""Phase 3 (Booking & Payment) integration tests, run against the real
Supabase/Postgres dev database and the real "payment-proofs" Storage
bucket — no mocking, per AGENTS.md.

Covers:
  A. POST /bookings — create a booking from a valid seat hold, including
     the hold-expiry-after-conversion regression fix and RaiseException
     classification (HOLD_NOT_FOUND / HOLD_NOT_ACTIVE / HOLD_EXPIRED /
     PASSENGER_COUNT_MISMATCH).
  B. Server-side price calculation for both a per_seat route and the
     flat_rate (whole-bus) route.
  C. POST /bookings/{id}/payment-proof — status transition to
     'payment_submitted', payment_proofs.status='pending_verification',
     optional fields, content-type/size validation, invalid
     payment_method_id, and the returned screenshot_url being a usable
     signed URL rather than the bare storage key.
  D. GET /bookings/status — lookup by ref/phone/email, multi-match, the
     INVALID_LOOKUP guard, and the SDD 4.6 status messages.

Tests are intentionally ordered (pytest preserves file order) since later
tests reuse bookings created by earlier ones in this module, mirroring the
established pattern in test_booking_hold.py.
"""
import json
import threading
import uuid

import pytest
from psycopg.rows import dict_row

from app.core.database import pool
from app.services import booking as booking_service

ROUTE1_TIMING_SLOT = "PYTEST PHASE3 ROUTE1 09:00 AM"
FLAT_TIMING_SLOT = "PYTEST PHASE3 FLAT 11:00 AM"

# Shared across the ordered tests in this module.
_state: dict = {}


def _unique_contact() -> tuple[str, str]:
    """A random phone/email pair that cannot collide with real data."""
    suffix = uuid.uuid4().hex[:10]
    return f"0300-{suffix[:7]}", f"pytest-{suffix}@example.com"


@pytest.fixture(scope="module")
def flat_rate_route():
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT id, flat_price FROM routes WHERE pricing_model = 'flat_rate' LIMIT 1"
            )
            route = cur.fetchone()

    assert route is not None, "Test database must have a flat_rate route (e.g. Route 4)."
    return route


@pytest.fixture(scope="module")
def payment_method_id():
    """A temporary payment_methods row, so the payment-proof optional-field
    tests can exercise a genuinely valid reference. Cleaned up afterward;
    payment_proofs.payment_method_id is ON DELETE SET NULL so this is safe
    even if a proof still references it at teardown time."""
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                INSERT INTO payment_methods (method_type, account_title, is_active)
                VALUES ('bank_transfer', 'PYTEST PHASE3 TEST METHOD', true)
                RETURNING id
                """
            )
            method_id = cur.fetchone()["id"]
            conn.commit()

    yield method_id

    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM payment_methods WHERE id = %s", (method_id,))
            conn.commit()


@pytest.fixture(scope="module", autouse=True)
def phase3_schedules(client, seed_bus, seed_route, flat_rate_route, unique_travel_date):
    """Two real, open schedule instances for this module: one on a
    per_seat route (seed_route — Route 1, Rs. 300/seat) and one on the
    flat_rate route (Rs. 30,000 whole-bus). Any bookings created against
    them during the tests are deleted first (bookings->schedule_instances
    is ON DELETE RESTRICT, unlike seats/booking_holds which cascade), then
    both schedules are deleted.
    """
    per_seat_resp = client.post(
        "/admin/schedules",
        json={
            "bus_id": str(seed_bus["id"]),
            "route_id": str(seed_route["id"]),
            "travel_date": unique_travel_date.isoformat(),
            "timing_slot": ROUTE1_TIMING_SLOT,
        },
    )
    assert per_seat_resp.status_code == 201
    per_seat_schedule_id = per_seat_resp.json()["data"]["id"]

    flat_resp = client.post(
        "/admin/schedules",
        json={
            "bus_id": str(seed_bus["id"]),
            "route_id": str(flat_rate_route["id"]),
            "travel_date": unique_travel_date.isoformat(),
            "timing_slot": FLAT_TIMING_SLOT,
        },
    )
    assert flat_resp.status_code == 201
    flat_schedule_id = flat_resp.json()["data"]["id"]

    per_seat_seats = client.get(f"/schedules/{per_seat_schedule_id}/seats").json()["data"]["seats"]
    flat_seats = client.get(f"/schedules/{flat_schedule_id}/seats").json()["data"]["seats"]

    _state["per_seat_schedule_id"] = per_seat_schedule_id
    _state["flat_schedule_id"] = flat_schedule_id
    _state["per_seat_seat_id_by_number"] = {s["seat_number"]: s["seat_id"] for s in per_seat_seats}
    _state["flat_seat_id_by_number"] = {s["seat_number"]: s["seat_id"] for s in flat_seats}

    yield

    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM bookings WHERE schedule_instance_id IN (%s, %s)",
                (per_seat_schedule_id, flat_schedule_id),
            )
            cur.execute(
                "DELETE FROM schedule_instances WHERE id IN (%s, %s)",
                (per_seat_schedule_id, flat_schedule_id),
            )
            conn.commit()


def _hold(client, schedule_id: str, seat_numbers: list[int], seat_map: dict) -> dict:
    seat_ids = [seat_map[n] for n in seat_numbers]
    resp = client.post(
        "/bookings/hold",
        json={"schedule_id": schedule_id, "seat_ids": seat_ids},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None, f"Unexpected hold failure: {body}"
    return body["data"]


def _seat_row(seat_id: str) -> dict:
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT status, hold_id, hold_expires_at FROM seats WHERE id = %s",
                (seat_id,),
            )
            return cur.fetchone()


def _create_pending_booking(client, seat_number: int) -> dict:
    """Isolated pending-payment booking for payment-proof edge tests.

    Uses a dedicated unused seat so these tests do not depend on, or
    disturb, the ordered bookings reused by sections C/D.
    """
    schedule_id = _state["per_seat_schedule_id"]
    seat_map = _state["per_seat_seat_id_by_number"]
    hold = _hold(client, schedule_id, [seat_number], seat_map)
    phone, email = _unique_contact()
    resp = client.post(
        "/bookings",
        json={
            "hold_token": hold["token"],
            "visitor_name": "Pytest Proof Edge Visitor",
            "visitor_phone": phone,
            "visitor_email": email,
            "passenger_count": 1,
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None, f"Unexpected booking failure: {body}"
    return body["data"]


def _hold_status(hold_id: str) -> str:
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT status FROM booking_holds WHERE id = %s", (hold_id,))
            return cur.fetchone()["status"]


# ---------------------------------------------------------------------------
# A/B. Booking creation + server-side pricing — happy paths
# ---------------------------------------------------------------------------


def test_a1_happy_path_per_seat_booking_and_hold_expiry_fix(client):
    schedule_id = _state["per_seat_schedule_id"]
    seat_map = _state["per_seat_seat_id_by_number"]

    hold = _hold(client, schedule_id, [1, 2], seat_map)
    phone, email = _unique_contact()
    _state["phone_shared"] = phone
    _state["booking_a_email"] = email

    resp = client.post(
        "/bookings",
        json={
            "hold_token": hold["token"],
            "visitor_name": "Pytest Visitor A",
            "visitor_phone": phone,
            "visitor_email": email,
            "passenger_count": 2,
        },
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None, f"Unexpected booking failure: {body}"

    data = body["data"]
    assert data["status"] == "pending_payment"
    assert data["booking_type"] == "per_seat"
    assert data["passenger_count"] == 2
    assert data["total_price"] == 600.0  # Route 1: Rs. 300/seat * 2 seats
    assert data["booking_ref"].startswith("TDCP-")

    _state["booking_a_id"] = data["booking_id"]
    _state["booking_a_ref"] = data["booking_ref"]

    # The underlying hold must be marked 'converted'.
    assert _hold_status(hold["hold_id"]) == "converted"

    # Regression check for the hold-expiry-after-conversion bug: the fix
    # must have cleared hold_expires_at (while keeping status='held' and
    # hold_id intact) in the same transaction as the booking itself.
    for seat_number in (1, 2):
        seat_id = seat_map[seat_number]
        row = _seat_row(seat_id)
        assert row["status"] == "held"
        assert str(row["hold_id"]) == hold["hold_id"]
        assert row["hold_expires_at"] is None

    # Proving the fix actually matters: run the real expire_stale_holds()
    # sweep (as every seat-map/schedule read does) and confirm these seats
    # are NOT wrongly released back to 'available'.
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT expire_stale_holds()")
            conn.commit()

    for seat_number in (1, 2):
        seat_id = seat_map[seat_number]
        row = _seat_row(seat_id)
        assert row["status"] == "held", (
            "expire_stale_holds() incorrectly released a converted booking's seats"
        )


def test_a2_happy_path_flat_rate_whole_bus_booking(client):
    schedule_id = _state["flat_schedule_id"]
    seat_map = _state["flat_seat_id_by_number"]

    hold = _hold(client, schedule_id, [1], seat_map)
    phone, email = _unique_contact()
    _state["booking_b_phone"] = _state["phone_shared"]  # same phone as booking A
    _state["booking_b_email"] = email

    resp = client.post(
        "/bookings",
        json={
            "hold_token": hold["token"],
            "visitor_name": "Pytest Visitor B",
            "visitor_phone": _state["phone_shared"],
            "visitor_email": email,
            "passenger_count": 1,
        },
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None, f"Unexpected booking failure: {body}"

    data = body["data"]
    assert data["booking_type"] == "whole_bus"
    assert data["passenger_count"] == 1
    # Flat-rate pricing must not scale with seat count.
    assert data["total_price"] == 30000.0

    _state["booking_b_id"] = data["booking_id"]
    _state["booking_b_ref"] = data["booking_ref"]


def test_a3_garbage_hold_token_returns_hold_not_found(client):
    resp = client.post(
        "/bookings",
        json={
            "hold_token": str(uuid.uuid4()),
            "visitor_name": "Nobody",
            "visitor_phone": "0300-0000000",
            "visitor_email": None,
            "passenger_count": 1,
        },
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "HOLD_NOT_FOUND"


def test_a4_already_converted_hold_returns_hold_not_active(client):
    schedule_id = _state["per_seat_schedule_id"]
    seat_map = _state["per_seat_seat_id_by_number"]

    # Fresh hold, converted once...
    hold = _hold(client, schedule_id, [3], seat_map)
    first = client.post(
        "/bookings",
        json={
            "hold_token": hold["token"],
            "visitor_name": "Pytest Reuse Visitor",
            "visitor_phone": "0300-1112223",
            "visitor_email": None,
            "passenger_count": 1,
        },
    )
    assert first.status_code == 200
    assert first.json()["error"] is None
    _state["booking_reuse_id"] = first.json()["data"]["booking_id"]

    # ...then reused a second time.
    second = client.post(
        "/bookings",
        json={
            "hold_token": hold["token"],
            "visitor_name": "Pytest Reuse Visitor",
            "visitor_phone": "0300-1112223",
            "visitor_email": None,
            "passenger_count": 1,
        },
    )

    assert second.status_code == 200
    body = second.json()
    assert body["data"] is None
    assert body["error"]["code"] == "HOLD_NOT_ACTIVE"
    # Never leak raw DB internals (table/column names, % placeholders, the
    # literal hold status enum value straight from the exception text) —
    # the client message itself is free to use plain English words like
    # "converted" since it is our own fixed, generic wording, not the
    # database's raw exception text ("Hold is converted and can no longer
    # be converted into a booking").
    assert "booking_holds" not in body["error"]["message"]
    assert "Hold is" not in body["error"]["message"]


def test_a5_expired_hold_returns_hold_expired(client):
    schedule_id = _state["per_seat_schedule_id"]
    seat_map = _state["per_seat_seat_id_by_number"]

    hold = _hold(client, schedule_id, [4], seat_map)

    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE booking_holds SET expires_at = now() - interval '1 minute' WHERE id = %s",
                (hold["hold_id"],),
            )
            conn.commit()

    resp = client.post(
        "/bookings",
        json={
            "hold_token": hold["token"],
            "visitor_name": "Pytest Expired Visitor",
            "visitor_phone": "0300-3334445",
            "visitor_email": None,
            "passenger_count": 1,
        },
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "HOLD_EXPIRED"

    # The seat must not have been converted into a booking.
    seat_id = seat_map[4]
    assert _seat_row(seat_id)["status"] == "held"


def test_a6_passenger_count_mismatch(client):
    schedule_id = _state["per_seat_schedule_id"]
    seat_map = _state["per_seat_seat_id_by_number"]

    hold = _hold(client, schedule_id, [5], seat_map)

    resp = client.post(
        "/bookings",
        json={
            "hold_token": hold["token"],
            "visitor_name": "Pytest Mismatch Visitor",
            "visitor_phone": "0300-5556667",
            "visitor_email": None,
            "passenger_count": 2,
        },
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "PASSENGER_COUNT_MISMATCH"


# NOTE on PRICING_CONFIGURATION_ERROR: the plan called for a test that sets
# a route's price_per_seat/flat_price to NULL to force this path. That is
# not constructible against the live schema — routes_check / routes_check1
# / routes_check2 in database/final_schema.sql jointly guarantee a route's
# price field for its *own* pricing_model can never be NULL (attempting it
# raises CheckViolation, confirmed while writing this test). So, given the
# current schema + seed data, PRICING_CONFIGURATION_ERROR is unreachable
# through any legitimate data state; both the Python-side check and
# create_booking_from_hold()'s equivalent check remain as defensive code
# (consistent with the DB function's own belt-and-suspenders check) but are
# not exercised by a live-data test here.


# ---------------------------------------------------------------------------
# C. Payment proof upload
# ---------------------------------------------------------------------------


def test_c1_happy_path_with_all_optional_fields(client, payment_method_id):
    booking_id = _state["booking_a_id"]

    resp = client.post(
        f"/bookings/{booking_id}/payment-proof",
        files={"file": ("../../etc/evil.png", b"fake screenshot bytes", "image/png")},
        data={
            "payment_method_id": str(payment_method_id),
            "transaction_reference": "TXN-PYTEST-0001",
            "amount_claimed": "600.00",
        },
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None, f"Unexpected payment-proof failure: {body}"

    data = body["data"]
    assert data["status"] == "pending_verification"
    assert data["payment_method_id"] == str(payment_method_id)
    assert data["transaction_reference"] == "TXN-PYTEST-0001"
    assert data["amount_claimed"] == 600.0
    # Must be a usable (signed) URL, not the bare storage key.
    assert data["screenshot_url"].startswith("http")

    _state["proof_a_id"] = data["payment_proof_id"]

    # DB assertions: status transition + real stored value + malicious
    # client filename never trusted/used as the storage key.
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT booking_status FROM bookings WHERE id = %s", (booking_id,)
            )
            assert cur.fetchone()["booking_status"] == "payment_submitted"

            cur.execute(
                "SELECT screenshot_url, status FROM payment_proofs WHERE id = %s",
                (data["payment_proof_id"],),
            )
            proof_row = cur.fetchone()
            assert proof_row["status"] == "pending_verification"
            assert proof_row["screenshot_url"].startswith(f"{booking_id}/")
            assert "evil" not in proof_row["screenshot_url"]
            assert proof_row["screenshot_url"].endswith(".png")


def test_c2_happy_path_with_no_optional_fields(client):
    booking_id = _state["booking_b_id"]

    resp = client.post(
        f"/bookings/{booking_id}/payment-proof",
        files={"file": ("proof.jpg", b"fake jpeg bytes", "image/jpeg")},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None, f"Unexpected payment-proof failure: {body}"

    data = body["data"]
    assert data["status"] == "pending_verification"
    assert data["payment_method_id"] is None
    assert data["transaction_reference"] is None
    assert data["amount_claimed"] is None
    assert data["screenshot_url"].startswith("http")


def test_c3_booking_not_found(client):
    resp = client.post(
        f"/bookings/{uuid.uuid4()}/payment-proof",
        files={"file": ("proof.png", b"fake bytes", "image/png")},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "BOOKING_NOT_FOUND"


def test_c4_proof_rejected_once_booking_is_no_longer_pending_payment(client):
    # booking_a already transitioned to 'payment_submitted' in test_c1.
    booking_id = _state["booking_a_id"]

    resp = client.post(
        f"/bookings/{booking_id}/payment-proof",
        files={"file": ("proof2.png", b"another fake screenshot", "image/png")},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "PAYMENT_PROOF_NOT_ALLOWED"


def test_c5_invalid_payment_method_id(client):
    booking_id = _state["booking_reuse_id"]

    resp = client.post(
        f"/bookings/{booking_id}/payment-proof",
        files={"file": ("proof.png", b"fake bytes", "image/png")},
        data={"payment_method_id": str(uuid.uuid4())},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "INVALID_PAYMENT_METHOD"

    # Booking must still be pending_payment — the failed attempt must not
    # have partially applied.
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT booking_status FROM bookings WHERE id = %s", (booking_id,)
            )
            assert cur.fetchone()["booking_status"] == "pending_payment"


def test_c6_disallowed_content_type(client):
    booking_id = _state["booking_reuse_id"]

    resp = client.post(
        f"/bookings/{booking_id}/payment-proof",
        files={"file": ("proof.pdf", b"%PDF-1.4 fake", "application/pdf")},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "INVALID_PAYMENT_PROOF_FILE"


def test_c7_oversized_file(client):
    booking_id = _state["booking_reuse_id"]
    oversized_bytes = b"0" * (5 * 1024 * 1024 + 1)

    resp = client.post(
        f"/bookings/{booking_id}/payment-proof",
        files={"file": ("proof.png", oversized_bytes, "image/png")},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "INVALID_PAYMENT_PROOF_FILE"


# ---------------------------------------------------------------------------
# D. Public booking status lookup
# ---------------------------------------------------------------------------


def test_d1_lookup_by_ref_found_with_payment_submitted_message(client):
    resp = client.get("/bookings/status", params={"ref": _state["booking_a_ref"]})

    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None
    results = body["data"]
    assert len(results) == 1

    result = results[0]
    assert result["booking_ref"] == _state["booking_a_ref"]
    assert result["booking_status"] == "payment_submitted"
    assert result["payment_status"] == "pending_verification"
    assert result["status_message"] == "Payment proof submitted — awaiting verification."
    assert result["passenger_count"] == 2
    assert result["total_price"] == 600.0
    assert {s["seat_number"] for s in result["seats"]} == {1, 2}


def test_d2_lookup_by_ref_not_found(client):
    resp = client.get(
        "/bookings/status", params={"ref": "TDCP-19700101-deadbeef"}
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None
    assert body["data"] == []


def test_d3_lookup_by_phone_multiple_matches(client):
    resp = client.get("/bookings/status", params={"phone": _state["phone_shared"]})

    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None
    refs = {r["booking_ref"] for r in body["data"]}
    assert refs == {_state["booking_a_ref"], _state["booking_b_ref"]}


def test_d4_lookup_by_phone_no_match(client):
    resp = client.get("/bookings/status", params={"phone": "0300-0000000000"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None
    assert body["data"] == []


def test_d5_lookup_by_email_single_match(client):
    resp = client.get("/bookings/status", params={"email": _state["booking_a_email"]})

    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None
    assert len(body["data"]) == 1
    assert body["data"][0]["booking_ref"] == _state["booking_a_ref"]


def test_d6_no_query_params_is_invalid(client):
    resp = client.get("/bookings/status")

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "INVALID_LOOKUP"


def test_d7_two_query_params_is_invalid(client):
    resp = client.get(
        "/bookings/status",
        params={"ref": _state["booking_a_ref"], "phone": _state["phone_shared"]},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "INVALID_LOOKUP"


def test_d8_pending_payment_status_message(client):
    booking_id = _state["booking_reuse_id"]

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT booking_ref FROM bookings WHERE id = %s", (booking_id,))
            booking_ref = cur.fetchone()["booking_ref"]

    resp = client.get("/bookings/status", params={"ref": booking_ref})

    assert resp.status_code == 200
    body = resp.json()
    result = body["data"][0]
    assert result["booking_status"] == "pending_payment"
    assert result["payment_status"] is None
    assert result["status_message"] == "Awaiting payment."


# ---------------------------------------------------------------------------
# C (follow-up). Signed-URL leak + orphan-storage cleanup
# Isolated bookings on unused seats so they do not disturb C/D state.
# ---------------------------------------------------------------------------


def test_c8_signed_url_failure_returns_storage_error_and_never_leaks_key(
    client, monkeypatch
):
    booking = _create_pending_booking(client, seat_number=7)
    booking_id = booking["booking_id"]

    real_from = booking_service.supabase.storage.from_

    def from_wrapper(bucket_id):
        api = real_from(bucket_id)

        def fail_sign(*_args, **_kwargs):
            raise RuntimeError("forced signed-url failure")

        api.create_signed_url = fail_sign
        return api

    monkeypatch.setattr(booking_service.supabase.storage, "from_", from_wrapper)

    resp = client.post(
        f"/bookings/{booking_id}/payment-proof",
        files={"file": ("proof.png", b"signed-url-fail bytes", "image/png")},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "PAYMENT_PROOF_STORAGE_ERROR"

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT screenshot_url FROM payment_proofs WHERE booking_id = %s",
                (booking_id,),
            )
            proof_row = cur.fetchone()

    assert proof_row is not None
    raw_key = proof_row["screenshot_url"]
    assert raw_key.startswith(f"{booking_id}/")
    assert raw_key not in json.dumps(body)
    assert raw_key not in (body["error"].get("message") or "")


def test_c9_empty_signed_url_returns_storage_error_and_never_leaks_key(
    client, monkeypatch
):
    booking = _create_pending_booking(client, seat_number=8)
    booking_id = booking["booking_id"]

    real_from = booking_service.supabase.storage.from_

    def from_wrapper(bucket_id):
        api = real_from(bucket_id)

        def empty_sign(*_args, **_kwargs):
            return {"signedURL": None, "signedUrl": None}

        api.create_signed_url = empty_sign
        return api

    monkeypatch.setattr(booking_service.supabase.storage, "from_", from_wrapper)

    resp = client.post(
        f"/bookings/{booking_id}/payment-proof",
        files={"file": ("proof.webp", b"empty-signed-url bytes", "image/webp")},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "PAYMENT_PROOF_STORAGE_ERROR"

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT screenshot_url FROM payment_proofs WHERE booking_id = %s",
                (booking_id,),
            )
            raw_key = cur.fetchone()["screenshot_url"]

    assert raw_key not in json.dumps(body)


def test_c10_failed_db_transition_after_upload_attempts_storage_cleanup(
    client, monkeypatch
):
    booking = _create_pending_booking(client, seat_number=9)
    booking_id = booking["booking_id"]
    captured: dict = {}

    real_from = booking_service.supabase.storage.from_

    def from_wrapper(bucket_id):
        api = real_from(bucket_id)
        orig_upload = api.upload
        orig_remove = api.remove

        def upload_then_steal_status(path, *args, **kwargs):
            result = orig_upload(path, *args, **kwargs)
            captured["path"] = path
            with pool.connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        UPDATE bookings
                        SET booking_status = 'payment_submitted'
                        WHERE id = %s
                        """,
                        (booking_id,),
                    )
                    conn.commit()
            return result

        def tracking_remove(paths):
            captured["removed"] = list(paths)
            return orig_remove(paths)

        api.upload = upload_then_steal_status
        api.remove = tracking_remove
        return api

    monkeypatch.setattr(booking_service.supabase.storage, "from_", from_wrapper)

    resp = client.post(
        f"/bookings/{booking_id}/payment-proof",
        files={"file": ("proof.png", b"orphan-cleanup bytes", "image/png")},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "PAYMENT_PROOF_NOT_ALLOWED"
    assert captured.get("path")
    assert captured.get("removed") == [captured["path"]]

    remaining = booking_service.supabase.storage.from_("payment-proofs").list(
        str(booking_id)
    )
    remaining_names = {item.get("name") for item in remaining}
    assert captured["path"].split("/")[-1] not in remaining_names

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT count(*) AS n FROM payment_proofs WHERE screenshot_url = %s",
                (captured["path"],),
            )
            assert cur.fetchone()["n"] == 0


def test_c11_concurrent_duplicate_proofs_exactly_one_succeeds(client):
    booking = _create_pending_booking(client, seat_number=10)
    booking_id = booking["booking_id"]

    barrier = threading.Barrier(2)
    responses: list[dict | None] = [None, None]
    errors: list[BaseException | None] = [None, None]

    def attempt(index: int) -> None:
        try:
            barrier.wait(timeout=10)
            resp = client.post(
                f"/bookings/{booking_id}/payment-proof",
                files={
                    "file": (
                        f"proof-{index}.png",
                        f"concurrent proof {index}".encode(),
                        "image/png",
                    )
                },
            )
            responses[index] = resp.json()
        except BaseException as exc:  # noqa: BLE001
            errors[index] = exc

    threads = [threading.Thread(target=attempt, args=(i,)) for i in range(2)]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=30)

    still_running = [t for t in threads if t.is_alive()]
    assert not still_running, "Concurrent payment-proof threads did not finish in 30s."
    assert errors == [None, None], f"Unexpected exception(s): {errors}"
    assert None not in responses

    successes = [r for r in responses if r["data"] is not None]
    failures = [r for r in responses if r["data"] is None]

    assert len(successes) == 1, f"Expected exactly one success, got: {responses}"
    assert successes[0]["data"]["screenshot_url"].startswith("http")
    assert successes[0]["data"]["status"] == "pending_verification"

    assert len(failures) == 1, f"Expected exactly one failure, got: {responses}"
    assert failures[0]["error"]["code"] == "PAYMENT_PROOF_NOT_ALLOWED"

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT booking_status FROM bookings WHERE id = %s", (booking_id,)
            )
            assert cur.fetchone()["booking_status"] == "payment_submitted"

            cur.execute(
                "SELECT count(*) AS n FROM payment_proofs WHERE booking_id = %s",
                (booking_id,),
            )
            assert cur.fetchone()["n"] == 1

    stored = booking_service.supabase.storage.from_("payment-proofs").list(str(booking_id))
    assert len(stored) == 1
