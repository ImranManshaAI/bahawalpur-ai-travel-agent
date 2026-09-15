from fastapi import APIRouter

from app.core.auth import UnauthorizedError
from app.schemas.admin_verification import AdminLoginRequest, AdminLoginResponse
from app.services.admin_auth import login_admin

router = APIRouter(prefix="/admin", tags=["Admin Auth"])


@router.post("/login", response_model=AdminLoginResponse)
def admin_login(request: AdminLoginRequest):
    try:
        result = login_admin(email=request.email, password=request.password)
    except UnauthorizedError as exc:
        raise exc

    return AdminLoginResponse(data=result, error=None)
