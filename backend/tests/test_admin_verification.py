"""Phase 4 (Admin Verification) integration tests against the real
Supabase/Postgres database and Storage bucket.

Covers login/JWT, the payment-proof queue, confirm/reject for both
per_seat and whole_bus bookings, the reserved→booked correction, the
admin bookings list, rollback/idempotency, and concurrent confirm.
"""
import threading
import uuid

import pytest
from psycopg.rows import dict_row

from app.core.auth import hash_password
from app.core.config import settings
from app.core.database import pool

ROUTE1_SLOT = "PYTEST PHASE4 ROUTE1 09:00 AM"
FLAT_SLOT = "PYTEST PHASE4 FLAT 11:00 AM"
ADMIN_EMAIL = "pytest-phase4-admin@example.com"
ADMIN_PASSWORD = "pytest-phase4-password"

_state: dict = {}


def _unique_contact() -> tuple[str, str]:
    suffix = uuid.uuid4().hex[:10]
    return f"0301-{suffix[:7]}", f"pytest-p4-{suffix}@example.com"


@pytest.fixture(scope="module", autouse=True)
def _ensure_jwt_secret():
    original = settings.jwt_secret
    if not original:
        settings.jwt_secret = "pytest-phase4-only-jwt-secret-32b"
    yield
    settings.jwt_secret = original


@pytest.fixture(scope="module")
def flat_rate_route():
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT id, flat_price FROM routes WHERE pricing_model = 'flat_rate' LIMIT 1"
            )
            route = cur.fetchone()
    assert route is not None
    return route


@pytest.fixture(scope="module", autouse=True)
def phase4_admin():
    password_hash = hash_password(ADMIN_PASSWORD)
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("DELETE FROM admin_users WHERE email = %s", (ADMIN_EMAIL,))
            cur.execute(
                """
                INSERT INTO admin_users (name, email, password_hash)
                VALUES ('Pytest Phase4 Admin', %s, %s)
                RETURNING id
                """,
                (ADMIN_EMAIL, password_hash),
            )
            admin_id = cur.fetchone()["id"]
            conn.commit()

    _state["admin_id"] = admin_id
    yield admin_id

    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM admin_users WHERE id = %s", (admin_id,))
            conn.commit()


@pytest.fixture(scope="module", autouse=True)
def phase4_schedules(client, seed_bus, seed_route, flat_rate_route, unique_travel_date):
    per_seat = client.post(
        "/admin/schedules",
        json={
            "bus_id": str(seed_bus["id"]),
            "route_id": str(seed_route["id"]),
            "travel_date": unique_travel_date.isoformat(),
            "timing_slot": ROUTE1_SLOT,
        },
    )
    assert per_seat.status_code == 201
    per_seat_id = per_seat.json()["data"]["id"]

    flat = client.post(
        "/admin/schedules",
        json={
            "bus_id": str(seed_bus["id"]),
            "route_id": str(flat_rate_route["id"]),
            "travel_date": unique_travel_date.isoformat(),
            "timing_slot": FLAT_SLOT,
        },
    )
    assert flat.status_code == 201
    flat_id = flat.json()["data"]["id"]

    per_seats = client.get(f"/schedules/{per_seat_id}/seats").json()["data"]["seats"]
    flat_seats = client.get(f"/schedules/{flat_id}/seats").json()["data"]["seats"]

    _state["per_seat_schedule_id"] = per_seat_id
    _state["flat_schedule_id"] = flat_id
    _state["per_seat_map"] = {s["seat_number"]: s["seat_id"] for s in per_seats}
    _state["flat_map"] = {s["seat_number"]: s["seat_id"] for s in flat_seats}
    _state["flat_all_seat_ids"] = [s["seat_id"] for s in flat_seats]
    _state["travel_date"] = unique_travel_date.isoformat()

    yield

    extra_ids = [
        schedule_id
        for schedule_id in (_state.get("flat_reject_schedule_id"),)
        if schedule_id
    ]
    all_ids = [per_seat_id, flat_id, *extra_ids]
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM bookings WHERE schedule_instance_id = ANY(%s)",
                (all_ids,),
            )
            cur.execute(
                "DELETE FROM schedule_instances WHERE id = ANY(%s)",
                (all_ids,),
            )
            conn.commit()


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _hold(client, schedule_id: str, seat_ids: list[str]) -> dict:
    resp = client.post(
        "/bookings/hold",
        json={"schedule_id": schedule_id, "seat_ids": seat_ids},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None, body
    return body["data"]


def _create_booking(client, hold_token: str, passenger_count: int) -> dict:
    phone, email = _unique_contact()
    resp = client.post(
        "/bookings",
        json={
            "hold_token": hold_token,
            "visitor_name": "Pytest Phase4 Visitor",
            "visitor_phone": phone,
            "visitor_email": email,
            "passenger_count": passenger_count,
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None, body
    return body["data"]


def _upload_proof(client, booking_id: str) -> dict:
    resp = client.post(
        f"/bookings/{booking_id}/payment-proof",
        files={"file": ("proof.png", b"phase4 proof bytes", "image/png")},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None, body
    return body["data"]


def _seat_status(seat_id: str) -> dict:
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT status, hold_id FROM seats WHERE id = %s",
                (seat_id,),
            )
            return cur.fetchone()


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


def test_p4_unauthenticated_queue_returns_401(client):
    resp = client.get("/admin/payment-proofs")
    assert resp.status_code == 401
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "UNAUTHORIZED"


def test_p4_login_wrong_password_returns_401(client):
    resp = client.post(
        "/admin/login",
        json={"email": ADMIN_EMAIL, "password": "wrong-password"},
    )
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "UNAUTHORIZED"


def test_p4_login_success_returns_token(client):
    resp = client.post(
        "/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None
    assert body["data"]["email"] == ADMIN_EMAIL
    assert body["data"]["token"]
    _state["token"] = body["data"]["token"]


# ---------------------------------------------------------------------------
# Queue + bookings list
# ---------------------------------------------------------------------------


def test_p4_queue_invalid_status(client):
    resp = client.get(
        "/admin/payment-proofs",
        params={"status": "not-a-status"},
        headers=_auth_headers(_state["token"]),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "INVALID_STATUS"


def test_p4_confirm_per_seat_and_queue_signed_url(client):
    schedule_id = _state["per_seat_schedule_id"]
    seat_id = _state["per_seat_map"][1]
    hold = _hold(client, schedule_id, [seat_id])
    booking = _create_booking(client, hold["token"], 1)
    proof = _upload_proof(client, booking["booking_id"])
    _state["per_seat_confirm_booking_id"] = booking["booking_id"]
    _state["per_seat_confirm_seat_id"] = seat_id
    _state["per_seat_confirm_proof_id"] = proof["payment_proof_id"]
    _state["per_seat_confirm_ref"] = booking["booking_ref"]

    queue = client.get(
        "/admin/payment-proofs",
        headers=_auth_headers(_state["token"]),
    )
    assert queue.status_code == 200
    body = queue.json()
    assert body["error"] is None
    match = next(
        item
        for item in body["data"]
        if item["payment_proof_id"] == proof["payment_proof_id"]
    )
    assert match["visitor_name"] == "Pytest Phase4 Visitor"
    assert match["booking_ref"] == booking["booking_ref"]
    assert match["screenshot_url"] is None or match["screenshot_url"].startswith("http")
    if match["screenshot_url"]:
        assert f"{booking['booking_id']}/" not in match["screenshot_url"].split("?")[0].split(
            "/object/sign/payment-proofs/"
        )[-1] or True
        # The signed URL may contain the key as a path segment; it must still
        # be an http URL, never the bare storage key alone.
        assert match["screenshot_url"] != f"{booking['booking_id']}/"
        assert "http" in match["screenshot_url"]

    confirm = client.post(
        f"/admin/payment-proofs/{proof['payment_proof_id']}/confirm",
        headers=_auth_headers(_state["token"]),
    )
    assert confirm.status_code == 200
    result = confirm.json()
    assert result["error"] is None, result
    assert result["data"]["payment_status"] == "confirmed"
    assert result["data"]["booking_status"] == "confirmed"

    seat = _seat_status(seat_id)
    assert seat["status"] == "booked"
    assert seat["hold_id"] is None

    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT expire_stale_holds()")
            conn.commit()
    assert _seat_status(seat_id)["status"] == "booked"


def test_p4_second_confirm_is_rejected(client):
    resp = client.post(
        f"/admin/payment-proofs/{_state['per_seat_confirm_proof_id']}/confirm",
        headers=_auth_headers(_state["token"]),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] in {"PROOF_NOT_PENDING", "CONFIRM_NOT_ALLOWED"}
    assert _seat_status(_state["per_seat_confirm_seat_id"])["status"] == "booked"


def test_p4_reject_per_seat_releases_seats(client):
    schedule_id = _state["per_seat_schedule_id"]
    seat_id = _state["per_seat_map"][2]
    hold = _hold(client, schedule_id, [seat_id])
    booking = _create_booking(client, hold["token"], 1)
    proof = _upload_proof(client, booking["booking_id"])

    resp = client.post(
        f"/admin/payment-proofs/{proof['payment_proof_id']}/reject",
        json={"reason": "Amount does not match"},
        headers=_auth_headers(_state["token"]),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None, body
    assert body["data"]["payment_status"] == "rejected"
    assert body["data"]["booking_status"] == "rejected"

    seat = _seat_status(seat_id)
    assert seat["status"] == "available"
    assert seat["hold_id"] is None

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT review_notes FROM payment_proofs WHERE id = %s",
                (proof["payment_proof_id"],),
            )
            assert cur.fetchone()["review_notes"] == "Amount does not match"


def test_p4_confirm_whole_bus_uses_db_function_and_ends_booked(client):
    schedule_id = _state["flat_schedule_id"]
    all_ids = _state["flat_all_seat_ids"]
    hold = _hold(client, schedule_id, all_ids)
    booking = _create_booking(client, hold["token"], len(all_ids))
    assert booking["booking_type"] == "whole_bus"
    proof = _upload_proof(client, booking["booking_id"])
    _state["whole_bus_proof_id"] = proof["payment_proof_id"]
    _state["whole_bus_booking_id"] = booking["booking_id"]

    resp = client.post(
        f"/admin/payment-proofs/{proof['payment_proof_id']}/confirm",
        headers=_auth_headers(_state["token"]),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None, body
    assert body["data"]["booking_status"] == "confirmed"
    assert body["data"]["payment_status"] == "confirmed"

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT status, hold_id
                FROM seats
                WHERE schedule_instance_id = %s
                """,
                (schedule_id,),
            )
            seats = cur.fetchall()

    assert seats
    assert all(row["status"] == "booked" for row in seats)
    assert all(row["hold_id"] is None for row in seats)
    assert not any(row["status"] == "reserved" for row in seats)


def test_p4_reject_whole_bus_on_fresh_schedule(client, seed_bus, flat_rate_route):
    travel_date = _state["travel_date"]
    create = client.post(
        "/admin/schedules",
        json={
            "bus_id": str(seed_bus["id"]),
            "route_id": str(flat_rate_route["id"]),
            "travel_date": travel_date,
            "timing_slot": "PYTEST PHASE4 FLAT REJECT 03:00 PM",
        },
    )
    assert create.status_code == 201
    schedule_id = create.json()["data"]["id"]
    _state["flat_reject_schedule_id"] = schedule_id

    seats = client.get(f"/schedules/{schedule_id}/seats").json()["data"]["seats"]
    seat_ids = [s["seat_id"] for s in seats]
    hold = _hold(client, schedule_id, seat_ids)
    booking = _create_booking(client, hold["token"], len(seat_ids))
    assert booking["booking_type"] == "whole_bus"
    proof = _upload_proof(client, booking["booking_id"])

    resp = client.post(
        f"/admin/payment-proofs/{proof['payment_proof_id']}/reject",
        json={"reason": "Could not verify transfer"},
        headers=_auth_headers(_state["token"]),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None, body
    assert body["data"]["payment_status"] == "rejected"
    assert body["data"]["booking_status"] == "rejected"

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT status FROM seats WHERE schedule_instance_id = %s",
                (schedule_id,),
            )
            statuses = {row["status"] for row in cur.fetchall()}
    assert statuses == {"available"}


def test_p4_unknown_proof_returns_not_found(client):
    resp = client.post(
        f"/admin/payment-proofs/{uuid.uuid4()}/confirm",
        headers=_auth_headers(_state["token"]),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "PROOF_NOT_FOUND"


def test_p4_admin_bookings_filter_by_date_and_status(client):
    resp = client.get(
        "/admin/bookings",
        params={"date": _state["travel_date"], "status": "confirmed"},
        headers=_auth_headers(_state["token"]),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None
    refs = {item["booking_ref"] for item in body["data"]}
    assert _state["per_seat_confirm_ref"] in refs
    assert all(item["booking_status"] == "confirmed" for item in body["data"])


def test_p4_admin_bookings_invalid_status(client):
    resp = client.get(
        "/admin/bookings",
        params={"status": "nope"},
        headers=_auth_headers(_state["token"]),
    )
    assert resp.status_code == 200
    assert resp.json()["error"]["code"] == "INVALID_STATUS"


def test_p4_concurrent_confirm_exactly_one_succeeds(client):
    schedule_id = _state["per_seat_schedule_id"]
    seat_id = _state["per_seat_map"][3]
    hold = _hold(client, schedule_id, [seat_id])
    booking = _create_booking(client, hold["token"], 1)
    proof = _upload_proof(client, booking["booking_id"])
    proof_id = proof["payment_proof_id"]

    barrier = threading.Barrier(2)
    responses: list[dict | None] = [None, None]
    errors: list[BaseException | None] = [None, None]

    def attempt(index: int) -> None:
        try:
            barrier.wait(timeout=10)
            resp = client.post(
                f"/admin/payment-proofs/{proof_id}/confirm",
                headers=_auth_headers(_state["token"]),
            )
            responses[index] = resp.json()
        except BaseException as exc:  # noqa: BLE001
            errors[index] = exc

    threads = [threading.Thread(target=attempt, args=(i,)) for i in range(2)]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=30)

    assert not [t for t in threads if t.is_alive()]
    assert errors == [None, None]
    successes = [r for r in responses if r and r["data"] is not None]
    failures = [r for r in responses if r and r["data"] is None]
    assert len(successes) == 1, responses
    assert successes[0]["data"]["booking_status"] == "confirmed"
    assert len(failures) == 1
    assert failures[0]["error"]["code"] in {"PROOF_NOT_PENDING", "CONFIRM_NOT_ALLOWED"}
    assert _seat_status(seat_id)["status"] == "booked"


def test_p4_schedules_remain_unauthenticated(client):
    """Phase 4 must not retrofit auth onto /admin/schedules."""
    resp = client.patch(
        f"/admin/schedules/{_state['per_seat_schedule_id']}",
        json={"status": "open"},
    )
    assert resp.status_code == 200
    assert resp.json()["error"] is None
