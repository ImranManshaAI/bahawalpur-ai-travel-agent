"""Phase 1 (Schedules & Seat Inventory) integration tests.

Maps 1:1 to the 12 test cases in the approved Phase 1 plan, Section K.
Tests are intentionally ordered (pytest preserves file/definition order; no
randomization plugin is installed) because tests 2-11 build on the single
schedule instance created by test 1 — this mirrors the plan's own numbering
and avoids re-creating (and re-verifying) the same schedule 11 times.

All data is real: there is no mocking layer. Seat counts referenced in
assertions (e.g. 67 = 49 upper + 18 lower) describe the one bus currently
seeded in the test database and are computed from `seed_bus`, never
hardcoded as business-logic expectations.
"""
import uuid
from datetime import date, datetime, timedelta, timezone

import pytest
from psycopg.rows import dict_row

from app.core.database import pool

TIMING_SLOT = "PYTEST 07:00 AM"

# Shared across the ordered tests in this module (schedule created by test 1,
# read/mutated by the tests that follow it).
_state: dict = {}


@pytest.fixture(scope="module", autouse=True)
def _cleanup_created_schedule():
    """Delete the schedule this module creates once all its tests finish.

    schedule_instances -> seats/booking_holds are ON DELETE CASCADE (see
    database/final_schema.sql), so this single delete is sufficient.
    """
    yield
    schedule_id = _state.get("schedule_id")
    if schedule_id is None:
        return
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM schedule_instances WHERE id = %s", (schedule_id,))
            conn.commit()


# ---------------------------------------------------------------------------
# 1. POST /admin/schedules happy path
# ---------------------------------------------------------------------------


def test_01_create_schedule_happy_path(client, seed_bus, seed_route, unique_travel_date):
    expected_seats = seed_bus["upper_deck_seats"] + seed_bus["lower_deck_seats"]
    assert expected_seats == 67  # documents the currently-seeded bus (49 + 18)

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
    body = resp.json()
    assert body["error"] is None
    data = body["data"]
    assert data["seats_generated"] == expected_seats
    assert data["status"] == "open"

    _state["schedule_id"] = data["id"]
    _state["expected_seats"] = expected_seats

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT status, count(*) AS c FROM seats "
                "WHERE schedule_instance_id = %s GROUP BY status",
                (data["id"],),
            )
            rows = cur.fetchall()

    assert rows == [{"status": "available", "c": expected_seats}]


# ---------------------------------------------------------------------------
# 2. Duplicate (bus_id, travel_date, timing_slot) -> 409
# ---------------------------------------------------------------------------


def test_02_create_schedule_duplicate_is_conflict(client, seed_bus, seed_route, unique_travel_date):
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT count(*) FROM schedule_instances "
                "WHERE bus_id = %s AND travel_date = %s AND timing_slot = %s",
                (seed_bus["id"], unique_travel_date, TIMING_SLOT),
            )
            before = cur.fetchone()[0]
    assert before == 1

    resp = client.post(
        "/admin/schedules",
        json={
            "bus_id": str(seed_bus["id"]),
            "route_id": str(seed_route["id"]),
            "travel_date": unique_travel_date.isoformat(),
            "timing_slot": TIMING_SLOT,
        },
    )

    assert resp.status_code == 409
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "SCHEDULE_ALREADY_EXISTS"

    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT count(*) FROM schedule_instances "
                "WHERE bus_id = %s AND travel_date = %s AND timing_slot = %s",
                (seed_bus["id"], unique_travel_date, TIMING_SLOT),
            )
            after = cur.fetchone()[0]

    assert after == 1  # no duplicate row; failed transaction rolled back cleanly


# ---------------------------------------------------------------------------
# 3. Nonexistent bus_id/route_id -> 400
# ---------------------------------------------------------------------------


def test_03_create_schedule_invalid_reference(client, seed_route, unique_travel_date):
    bogus_bus_id = str(uuid.uuid4())

    resp = client.post(
        "/admin/schedules",
        json={
            "bus_id": bogus_bus_id,
            "route_id": str(seed_route["id"]),
            "travel_date": unique_travel_date.isoformat(),
            "timing_slot": "PYTEST INVALID REFERENCE",
        },
    )

    assert resp.status_code == 400
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "INVALID_REFERENCE"

    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT count(*) FROM schedule_instances WHERE bus_id = %s",
                (bogus_bus_id,),
            )
            count = cur.fetchone()[0]

    assert count == 0  # no partial row inserted


# ---------------------------------------------------------------------------
# 4. GET /schedules?date= shows the created schedule with live counts
# ---------------------------------------------------------------------------


def test_04_list_schedules_shows_created_schedule(client, seed_bus, unique_travel_date):
    resp = client.get("/schedules", params={"date": unique_travel_date.isoformat()})

    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None

    matches = [
        item for item in body["data"] if item["schedule_instance_id"] == _state["schedule_id"]
    ]
    assert len(matches) == 1
    item = matches[0]
    assert item["total_seats"] == _state["expected_seats"]
    assert item["available_seats"] == _state["expected_seats"]
    assert item["status"] == "open"
    assert item["timing_slot"] == TIMING_SLOT


# ---------------------------------------------------------------------------
# 5. available_seats reflects held/booked seats
# ---------------------------------------------------------------------------


def test_05_available_seats_reflects_held_and_booked(client, unique_travel_date):
    schedule_id = _state["schedule_id"]

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            # seat 2 (upper) -> held, not yet expired.
            cur.execute(
                "UPDATE seats SET status = 'held', hold_expires_at = %s "
                "WHERE schedule_instance_id = %s AND seat_number = 2",
                (datetime.now(timezone.utc) + timedelta(minutes=10), schedule_id),
            )
            # seat 55 (lower) -> booked.
            cur.execute(
                "UPDATE seats SET status = 'booked' "
                "WHERE schedule_instance_id = %s AND seat_number = 55",
                (schedule_id,),
            )
            conn.commit()

    resp = client.get("/schedules", params={"date": unique_travel_date.isoformat()})
    assert resp.status_code == 200

    item = next(i for i in resp.json()["data"] if i["schedule_instance_id"] == schedule_id)
    assert item["total_seats"] == _state["expected_seats"]
    assert item["available_seats"] == _state["expected_seats"] - 2


# ---------------------------------------------------------------------------
# 6. GET /schedules?date= with no schedules -> empty list
# ---------------------------------------------------------------------------


def test_06_list_schedules_empty_date(client):
    empty_date = date.today() + timedelta(days=9999)

    resp = client.get("/schedules", params={"date": empty_date.isoformat()})

    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None
    assert body["data"] == []


# ---------------------------------------------------------------------------
# 7. GET /schedules/{id}/seats returns the full seat map
# ---------------------------------------------------------------------------


def test_07_get_seat_map_full(client):
    schedule_id = _state["schedule_id"]

    resp = client.get(f"/schedules/{schedule_id}/seats")

    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None
    data = body["data"]
    assert data["schedule_instance_id"] == schedule_id
    assert len(data["seats"]) == _state["expected_seats"]

    by_number = {seat["seat_number"]: seat for seat in data["seats"]}
    assert by_number[1]["deck"] == "upper"
    assert by_number[_state["expected_seats"]]["deck"] == "lower"


# ---------------------------------------------------------------------------
# 8. GET /schedules/{bad-id}/seats -> 404
# ---------------------------------------------------------------------------


def test_08_get_seat_map_not_found(client):
    resp = client.get(f"/schedules/{uuid.uuid4()}/seats")

    assert resp.status_code == 404
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "SCHEDULE_NOT_FOUND"


# ---------------------------------------------------------------------------
# 9. PATCH .../{id} {"status": "closed"} -> 200, disappears from open list,
#    still fully visible via the seat map.
# ---------------------------------------------------------------------------


def test_09_patch_close_schedule(client, unique_travel_date):
    schedule_id = _state["schedule_id"]

    resp = client.patch(f"/admin/schedules/{schedule_id}", json={"status": "closed"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None
    assert body["data"]["status"] == "closed"

    list_resp = client.get("/schedules", params={"date": unique_travel_date.isoformat()})
    ids_in_open_list = {i["schedule_instance_id"] for i in list_resp.json()["data"]}
    assert schedule_id not in ids_in_open_list

    seats_resp = client.get(f"/schedules/{schedule_id}/seats")
    assert seats_resp.status_code == 200
    assert len(seats_resp.json()["data"]["seats"]) == _state["expected_seats"]


# ---------------------------------------------------------------------------
# 10. PATCH .../{bad-id} -> 404
# ---------------------------------------------------------------------------


def test_10_patch_not_found(client):
    resp = client.patch(f"/admin/schedules/{uuid.uuid4()}", json={"status": "open"})

    assert resp.status_code == 404
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "SCHEDULE_NOT_FOUND"


# ---------------------------------------------------------------------------
# 11. Lazy-expiry check: expire_stale_holds() is effective from the read
#     paths, even though this schedule is now closed (get_seat_map does not
#     filter by schedule status, so it still exercises the expiry call).
# ---------------------------------------------------------------------------


def test_11_lazy_expiry_from_seat_map_read(client):
    schedule_id = _state["schedule_id"]

    with pool.connection() as conn:
        with conn.cursor() as cur:
            # seat 10 (upper): force it into a stale-held state, bypassing
            # create_seat_hold entirely, exactly like a real lapsed hold.
            cur.execute(
                "UPDATE seats SET status = 'held', hold_expires_at = %s "
                "WHERE schedule_instance_id = %s AND seat_number = 10",
                (datetime.now(timezone.utc) - timedelta(minutes=5), schedule_id),
            )
            conn.commit()

    resp = client.get(f"/schedules/{schedule_id}/seats")
    assert resp.status_code == 200

    seat_10 = next(s for s in resp.json()["data"]["seats"] if s["seat_number"] == 10)
    assert seat_10["status"] == "available"


# ---------------------------------------------------------------------------
# 12. Regression: existing /bookings/* behavior is unchanged.
# ---------------------------------------------------------------------------


def test_12_existing_booking_endpoints_unchanged(client):
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT si.id AS schedule_id, s.id AS seat_id "
                "FROM schedule_instances si "
                "JOIN seats s ON s.schedule_instance_id = si.id AND s.status = 'available' "
                "ORDER BY si.created_at LIMIT 1"
            )
            row = cur.fetchone()

    if row is None:
        pytest.skip("No pre-existing schedule with an available seat to run the regression check against.")

    resp = client.post(
        "/bookings/hold",
        json={"schedule_id": str(row["schedule_id"]), "seat_ids": [str(row["seat_id"])]},
    )

    # Existing behavior, unaffected by the new Phase 1 exception handlers
    # (NotFoundError/ConflictError/InvalidReferenceError/UpstreamDatabaseError
    # are never raised by this code path): always HTTP 200 with a {data,
    # error} body, never one of the new custom error codes.
    assert resp.status_code == 200
    body = resp.json()
    assert "data" in body and "error" in body

    if body["error"] is not None:
        assert body["error"]["code"] == "SEAT_UNAVAILABLE"
    else:
        # Clean up immediately so this regression check has no lasting
        # side effect on shared seed data.
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT release_seat_hold(%s)", (body["data"]["token"],))
                conn.commit()
