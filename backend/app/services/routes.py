"""Read-only route catalog access. Prices and names come from the
authoritative ``routes`` table — never from FAQ text or the frontend.
"""
from psycopg.rows import dict_row

from app.core.database import pool


def list_active_routes() -> list[dict]:
    """Return active TDCP Double-Decker routes and their configured prices."""
    query = """
        SELECT id, name, description, pricing_model, price_per_seat, flat_price
        FROM routes
        WHERE status = 'active'
        ORDER BY name
    """

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query)
            return cur.fetchall()
