"""Shared fixtures for the Phase 1 integration test suite.

These tests run against a real Postgres/Supabase instance (the project has
no ORM/mocking layer, and AGENTS.md requires verifying real transactional
and concurrency behavior rather than mocking the database). All seed data
(bus/route ids) is read dynamically from the database rather than
hardcoded, per AGENTS.md's "no hardcoded seat counts / no invented data"
rule.
"""
import random
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from psycopg.rows import dict_row

from app.core.database import pool
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def _db_pool():
    """Open the shared connection pool once for the whole test session.

    Mirrors app/main.py's lifespan, but opened once here instead of once per
    TestClient context, since these tests reuse a single session-scoped
    client and issue direct setup/teardown queries as well.
    """
    pool.open(wait=True, timeout=30)
    yield
    pool.close()


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture(scope="session")
def seed_bus():
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT id, upper_deck_seats, lower_deck_seats "
                "FROM buses ORDER BY created_at LIMIT 1"
            )
            bus = cur.fetchone()

    assert bus is not None, "Test database must have at least one seeded bus."
    return bus


@pytest.fixture(scope="session")
def seed_route():
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT id FROM routes ORDER BY name LIMIT 1")
            route = cur.fetchone()

    assert route is not None, "Test database must have at least one seeded route."
    return route


@pytest.fixture(scope="module")
def unique_travel_date():
    """A travel_date far enough in the future, and randomized, that it will
    not collide with any pre-existing schedule_instances row for the seeded
    bus (uniqueness is per bus_id+travel_date+timing_slot)."""
    return date.today() + timedelta(days=3650 + random.randint(0, 3000))
