from datetime import datetime, timedelta, timezone
from uuid import UUID

import bcrypt
import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

_JWT_ALGORITHM = "HS256"
_JWT_EXPIRY_HOURS = 8

_bearer = HTTPBearer(auto_error=False)


class UnauthorizedError(Exception):
    """Missing, expired, or invalid admin credentials/token."""


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_access_token(admin_id: UUID, email: str) -> str:
    if not settings.jwt_secret:
        raise RuntimeError("JWT_SECRET is not configured.")

    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(admin_id),
        "email": email,
        "iat": now,
        "exp": now + timedelta(hours=_JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=_JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    if not settings.jwt_secret:
        raise UnauthorizedError("Authentication is temporarily unavailable.")

    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[_JWT_ALGORITHM])
    except jwt.ExpiredSignatureError as exc:
        raise UnauthorizedError("This session has expired. Please log in again.") from exc
    except jwt.InvalidTokenError as exc:
        raise UnauthorizedError("Invalid authentication token.") from exc

    admin_id = payload.get("sub")
    email = payload.get("email")
    if not admin_id or not email:
        raise UnauthorizedError("Invalid authentication token.")

    return {"admin_id": UUID(admin_id), "email": email}


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    if credentials is None or credentials.scheme.lower() != "bearer" or not credentials.credentials:
        raise UnauthorizedError("Authentication required.")

    return decode_access_token(credentials.credentials)
