"""Phase 2 (Seat Holds) focused tests for the three fixes applied to
POST /bookings/hold after the Phase 2 review:

  A. Invalid / duplicate seat_ids no longer cause an unhandled 500.
  B. create_seat_hold() failures are classified correctly (not all lumped
     into SEAT_UNAVAILABLE), without leaking raw DB text.
  D. A closed schedule cannot accept a new hold.

Plus a dedicated happy-path test proving the successful hold response shape
is unchanged. Tests are intentionally ordered (pytest preserves file order;
no randomization plugin is installed) since several tests build on the one
schedule instance created for this module, mirroring test_schedules.py's
established pattern.

The final test in this module is the Phase 2 concurrency test required by
BACKEND_PLAN.md: two genuinely simultaneous hold requests for the very same
seat, fired through the real POST /bookings/hold endpoint against the real
dev database, proving that create_seat_hold()'s row-level locking
(`SELECT ... FOR UPDATE` on the target seat rows, see
database/final_schema.sql) makes concurrent holds on one seat safe.
"""
import threading
import uuid

import pytest
from psycopg.rows import dict_row

from app.core.database import pool

TIMING_SLOT = "PYTEST HOLD 09:00 AM"

# Shared across the ordered tests in this module.
_state: dict = {}


@pytest.fixture(scope="module", autouse=True)
def hold_test_schedule(client, seed_bus, seed_route, unique_travel_date):
    """Create a real, open schedule instance (via the Phase 1 admin
    endpoint) with a full seat inventory, for these hold tests to use.
    Deleted (cascades to seats/booking_holds) once the module finishes.
    """
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

    seats_resp = client.get(f"/schedules/{schedule_id}/seats")
    assert seats_resp.status_code == 200
    seats = seats_resp.json()["data"]["seats"]

    _state["schedule_id"] = schedule_id
    _state["seat_id_by_number"] = {s["seat_number"]: s["seat_id"] for s in seats}

    yield

    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM schedule_instances WHERE id = %s", (schedule_id,))
            conn.commit()


def _seat_status(seat_id: str) -> str:
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT status FROM seats WHERE id = %s", (seat_id,))
            return cur.fetchone()["status"]


# ---------------------------------------------------------------------------
# Issue A.1 — invalid seat_id for the requested schedule
# ---------------------------------------------------------------------------


def test_a1_invalid_seat_id_returns_client_error_not_500(client):
    schedule_id = _state["schedule_id"]
    bogus_seat_id = str(uuid.uuid4())

    resp = client.post(
        "/bookings/hold",
        json={"schedule_id": schedule_id, "seat_ids": [bogus_seat_id]},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "SEAT_NOT_FOUND"


# ---------------------------------------------------------------------------
# Issue A.2 — duplicate seat_ids
# ---------------------------------------------------------------------------


def test_a2_duplicate_seat_ids_returns_client_error_not_500(client):
    schedule_id = _state["schedule_id"]
    seat_id = _state["seat_id_by_number"][1]

    resp = client.post(
        "/bookings/hold",
        json={"schedule_id": schedule_id, "seat_ids": [seat_id, seat_id]},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "DUPLICATE_SEAT_IDS"

    # The seat must not have been touched by the failed attempt.
    assert _seat_status(seat_id) == "available"


# ---------------------------------------------------------------------------
# Happy path — successful hold behavior/response shape unchanged
# ---------------------------------------------------------------------------


def test_happy_path_hold_still_works(client):
    schedule_id = _state["schedule_id"]
    seat_id = _state["seat_id_by_number"][2]

    resp = client.post(
        "/bookings/hold",
        json={"schedule_id": schedule_id, "seat_ids": [seat_id]},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["error"] is None

    data = body["data"]
    assert data["seat_ids"] == [seat_id]
    assert data["status"] == "held"
    assert data["remaining_seconds"] > 0
    assert "hold_id" in data and "token" in data and "held_at" in data and "hold_expires_at" in data

    assert _seat_status(seat_id) == "held"

    _state["held_seat_id"] = seat_id


# ---------------------------------------------------------------------------
# Issue B.1 — a genuinely unavailable seat is still SEAT_UNAVAILABLE
# ---------------------------------------------------------------------------


def test_b1_unavailable_seat_still_classified_correctly(client):
    schedule_id = _state["schedule_id"]
    seat_id = _state["held_seat_id"]  # already 'held' by the previous test

    resp = client.post(
        "/bookings/hold",
        json={"schedule_id": schedule_id, "seat_ids": [seat_id]},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] is None
    assert body["error"]["code"] == "SEAT_UNAVAILABLE"
    assert seat_id in body["error"]["details"]["unavailable_seat_ids"]


# ---------------------------------------------------------------------------
# Issue B.2 — a configuration/business-rule DB error is NOT mislabeled as
# SEAT_UNAVAILABLE, and no raw DB text is leaked to the client.
# ---------------------------------------------------------------------------


def test_b2_configuration_error_not_classified_as_seat_unavailable(client):
    schedule_id = _state["schedule_id"]
    seat_id = _state["seat_id_by_number"][4]

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT default_hold_duration_minutes FROM system_settings WHERE id = 1")
            original_value = cur.fetchone()["default_hold_duration_minutes"]

    try:
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE system_settings SET default_hold_duration_minutes = NULL WHERE id = 1"
                )
                conn.commit()

        resp = client.post(
            "/bookings/hold",
            json={"schedule_id": schedule_id, "seat_ids": [seat_id]},
        )

        assert resp.status_code == 200
        body = resp.json()
        assert body["data"] is None
        assert body["error"]["code"] == "HOLD_CONFIGURATION_ERROR"
        assert body["error"]["code"] != "SEAT_UNAVAILABLE"
        # Never leak raw Postgres/internal error text to the client.
        assert "system_settings" not in body["error"]["message"]
        assert "default_hold_duration_minutes" not in body["error"]["message"]
    finally:
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE system_settings SET default_hold_duration_minutes = %s WHERE id = 1",
                    (original_value,),
                )
                conn.commit()

    # The seat must not have been touched by the failed attempt.
    assert _seat_status(seat_id) == "available"


# ---------------------------------------------------------------------------
# Issue D — a closed schedule cannot accept a new hold
# ---------------------------------------------------------------------------


def test_d1_closed_schedule_rejects_hold(client):
    schedule_id = _state["schedule_id"]
    seat_id = _state["seat_id_by_number"][3]

    patch_resp = client.patch(f"/admin/schedules/{schedule_id}", json={"status": "closed"})
    assert patch_resp.status_code == 200

    try:
        resp = client.post(
            "/bookings/hold",
            json={"schedule_id": schedule_id, "seat_ids": [seat_id]},
        )

        assert resp.status_code == 200
        body = resp.json()
        assert body["data"] is None
        assert body["error"]["code"] == "SCHEDULE_CLOSED"

        # The seat must not have been touched by the rejected attempt.
        assert _seat_status(seat_id) == "available"
    finally:
        # Reopen so this module leaves the schedule in a known, open state.
        reopen_resp = client.patch(f"/admin/schedules/{schedule_id}", json={"status": "open"})
        assert reopen_resp.status_code == 200


# ---------------------------------------------------------------------------
# Phase 2 required concurrency test (BACKEND_PLAN.md) — two genuinely
# simultaneous POST /bookings/hold requests for the SAME seat on the SAME
# schedule must not both succeed.
# ---------------------------------------------------------------------------


def test_e1_concurrent_holds_on_same_seat_exactly_one_succeeds(client):
    schedule_id = _state["schedule_id"]
    # Seat 5 is untouched by every earlier test in this module (seats 1-4
    # are used above), so it is guaranteed 'available' going into this test.
    seat_id = _state["seat_id_by_number"][5]
    assert _seat_status(seat_id) == "available"

    barrier = threading.Barrier(2)
    responses: list[dict | None] = [None, None]
    errors: list[BaseException | None] = [None, None]

    def attempt(index: int) -> None:
        try:
            # Both threads block here until both have arrived, so the two
            # POST /bookings/hold calls are issued as close to
            # simultaneously as the test process can arrange. Each request
            # is handled by FastAPI's sync-endpoint threadpool on its own
            # OS thread with its own DB connection from the pool, so the
            # two create_seat_hold() calls genuinely race at the database
            # level (not just at the Python-thread level).
            barrier.wait(timeout=10)
            resp = client.post(
                "/bookings/hold",
                json={"schedule_id": schedule_id, "seat_ids": [seat_id]},
            )
            responses[index] = resp.json()
        except BaseException as exc:  # noqa: BLE001 - surfaced via assertions below
            errors[index] = exc

    threads = [threading.Thread(target=attempt, args=(i,)) for i in range(2)]
    for t in threads:
        t.start()
    for t in threads:
        # Generous but bounded join timeout: a real deadlock/hang must
        # surface as a test failure here, not an indefinitely stuck suite.
        t.join(timeout=30)

    still_running = [t for t in threads if t.is_alive()]
    assert not still_running, (
        "Concurrency test thread(s) did not finish within 30s — this points "
        "to a genuine hang (DB lock or network stall), not a normal race "
        "outcome. Inspect pg_stat_activity / thread state before assuming "
        "a deadlock."
    )

    assert errors == [None, None], f"Unexpected exception(s) in worker threads: {errors}"
    assert None not in responses, "Both requests must have received a response."

    successes = [r for r in responses if r["data"] is not None]
    failures = [r for r in responses if r["data"] is None]

    # Exactly one request wins the seat...
    assert len(successes) == 1, f"Expected exactly one success, got: {responses}"
    winner = successes[0]
    assert winner["data"]["seat_ids"] == [seat_id]
    assert winner["data"]["status"] == "held"

    # ...and exactly one request correctly observes the seat as unavailable
    # (not a spurious 500, not a misclassified error).
    assert len(failures) == 1, f"Expected exactly one failure, got: {responses}"
    loser = failures[0]
    assert loser["error"]["code"] == "SEAT_UNAVAILABLE"
    assert seat_id in loser["error"]["details"]["unavailable_seat_ids"]

    # The database must reflect exactly one successful hold on this seat:
    # the seat is held by exactly one booking_holds row, and no partial or
    # duplicate hold state exists.
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT status, hold_id, hold_expires_at FROM seats WHERE id = %s",
                (seat_id,),
            )
            seat_row = cur.fetchone()
            assert seat_row["status"] == "held"
            assert seat_row["hold_id"] is not None
            assert seat_row["hold_expires_at"] is not None

            cur.execute(
                """
                SELECT count(*) AS n
                FROM booking_holds
                WHERE id = %s AND status = 'active'
                """,
                (seat_row["hold_id"],),
            )
            assert cur.fetchone()["n"] == 1

            # No other booking_holds row references this same seat.
            cur.execute(
                """
                SELECT count(DISTINCT hold_id) AS n
                FROM seats
                WHERE id = %s AND hold_id IS NOT NULL
                """,
                (seat_id,),
            )
            assert cur.fetchone()["n"] == 1
