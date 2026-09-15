from psycopg.rows import dict_row

from app.core.auth import UnauthorizedError, create_access_token, verify_password
from app.core.database import pool


def login_admin(email: str, password: str) -> dict:
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT id, name, email, password_hash
                FROM admin_users
                WHERE email = %s
                """,
                (email,),
            )
            admin = cur.fetchone()

    if admin is None or not verify_password(password, admin["password_hash"]):
        raise UnauthorizedError("Invalid email or password.")

    return {
        "token": create_access_token(admin["id"], admin["email"]),
        "admin_id": admin["id"],
        "name": admin["name"],
        "email": admin["email"],
    }
