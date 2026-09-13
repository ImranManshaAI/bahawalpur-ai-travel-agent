from datetime import date
from uuid import UUID

from psycopg.errors import ForeignKeyViolation, RaiseException, UniqueViolation
from psycopg.rows import dict_row

from app.core.database import pool
from app.core.errors import ConflictError, InvalidReferenceError, NotFoundError, UpstreamDatabaseError


def create_schedule(
    bus_id: UUID,
    route_id: UUID,
    travel_date: date,
    timing_slot: str,
) -> dict:
    """Create a schedule instance and its full seat inventory as one
    all-or-nothing transaction.

    Reuses the authoritative ``generate_seats_for_schedule`` database
    function for seat generation rather than reimplementing it here.
    """
    insert_query = """
        INSERT INTO schedule_instances (bus_id, route_id, travel_date, timing_slot)
        VALUES (%s, %s, %s, %s)
        RETURNING id, bus_id, route_id, travel_date, timing_slot, status, created_at
    """

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            try:
                cur.execute(insert_query, (bus_id, route_id, travel_date, timing_slot))
            except UniqueViolation as exc:
                raise ConflictError(
                    f"A schedule instance already exists for bus {bus_id} on "
                    f"{travel_date} at timing slot '{timing_slot}'."
                ) from exc
            except ForeignKeyViolation as exc:
                raise InvalidReferenceError(
                    f"bus_id {bus_id} or route_id {route_id} does not exist."
                ) from exc

            schedule = cur.fetchone()

            try:
                cur.execute(
                    "SELECT generate_seats_for_schedule(%s, %s)",
                    (schedule["id"], bus_id),
                )
            except RaiseException as exc:
                raise UpstreamDatabaseError(str(exc)) from exc

            cur.execute(
                "SELECT count(*) AS seats_generated FROM seats WHERE schedule_instance_id = %s",
                (schedule["id"],),
            )
            seats_generated = cur.fetchone()["seats_generated"]

            conn.commit()

    return {**schedule, "seats_generated": seats_generated}


def list_schedules(travel_date: date) -> list[dict]:
    """List open schedule instances for a date with live seat counts.

    Calls the authoritative ``expire_stale_holds()`` function first so any
    seat whose hold has already lapsed is released back to ``available``
    before counts are computed — see Phase 1 plan Section 1 for the full
    safety analysis of this call.
    """
    query = """
        SELECT si.id AS schedule_instance_id, si.route_id, r.name AS route_name,
               si.travel_date, si.timing_slot, si.status,
               COUNT(s.id) AS total_seats,
               COUNT(s.id) FILTER (WHERE s.status = 'available') AS available_seats
        FROM schedule_instances si
        JOIN routes r ON r.id = si.route_id
        LEFT JOIN seats s ON s.schedule_instance_id = si.id
        WHERE si.travel_date = %s AND si.status = 'open'
        GROUP BY si.id, si.route_id, r.name, si.travel_date, si.timing_slot, si.status
        ORDER BY si.timing_slot
    """

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT expire_stale_holds()")
            conn.commit()

            cur.execute(query, (travel_date,))
            rows = cur.fetchall()

    return rows


def get_seat_map(schedule_id: UUID) -> dict:
    """Return the full seat map for one schedule instance.

    Calls ``expire_stale_holds()`` first, for the same reason as
    ``list_schedules`` — see Phase 1 plan Section 1. Does not filter by the
    schedule's own open/closed status: a closed schedule's seat map must
    still be viewable (e.g. by an admin).
    """
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT id AS schedule_instance_id, travel_date, timing_slot, status
                FROM schedule_instances
                WHERE id = %s
                """,
                (schedule_id,),
            )
            schedule = cur.fetchone()

            if schedule is None:
                raise NotFoundError(f"Schedule instance {schedule_id} not found.")

            cur.execute("SELECT expire_stale_holds()")
            conn.commit()

            cur.execute(
                """
                SELECT id AS seat_id, seat_number, deck, status
                FROM seats
                WHERE schedule_instance_id = %s
                ORDER BY deck, seat_number
                """,
                (schedule_id,),
            )
            seats = cur.fetchall()

    return {**schedule, "seats": seats}


def update_schedule_status(schedule_id: UUID, status: str) -> dict:
    """Open or close a schedule instance. No cascading effect on its seats."""
    query = """
        UPDATE schedule_instances
        SET status = %s
        WHERE id = %s
        RETURNING id, bus_id, route_id, travel_date, timing_slot, status
    """

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query, (status, schedule_id))
            schedule = cur.fetchone()

            if schedule is None:
                raise NotFoundError(f"Schedule instance {schedule_id} not found.")

            conn.commit()

    return schedule
