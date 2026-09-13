from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.database import pool
from app.core.errors import ConflictError, InvalidReferenceError, NotFoundError, UpstreamDatabaseError
from app.routers.admin_schedules import router as admin_schedules_router
from app.routers.bookings import router as bookings_router
from app.routers.schedules import router as schedules_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    pool.open(wait=True)
    yield
    pool.close()


app = FastAPI(
    title="Bahawalpur AI Travel Agent API",
    version="0.1.0",
    lifespan=lifespan,
)


app.include_router(bookings_router)
app.include_router(schedules_router)
app.include_router(admin_schedules_router)


def _error_response(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"data": None, "error": {"code": code, "message": message, "details": None}},
    )


# Exception handlers below are scoped to the four exception types defined in
# app/core/errors.py. As of Phase 3, /bookings/{id}/payment-proof does raise
# InvalidReferenceError (for an invalid payment_method_id), but it is always
# caught locally inside that endpoint and translated into the standard
# {data, error} envelope before it can propagate — so these global handlers
# still have no effect on /bookings/* responses; they only apply to routes
# that let one of these four types propagate uncaught (currently
# /admin/schedules/* and /schedules/*). No generic catch-all `Exception`
# handler is registered: unexpected errors on any endpoint fall through to
# FastAPI's normal default 500 handling, unchanged.


@app.exception_handler(NotFoundError)
def handle_not_found(request: Request, exc: NotFoundError):
    return _error_response(404, "SCHEDULE_NOT_FOUND", str(exc))


@app.exception_handler(ConflictError)
def handle_conflict(request: Request, exc: ConflictError):
    return _error_response(409, "SCHEDULE_ALREADY_EXISTS", str(exc))


@app.exception_handler(InvalidReferenceError)
def handle_invalid_reference(request: Request, exc: InvalidReferenceError):
    return _error_response(400, "INVALID_REFERENCE", str(exc))


@app.exception_handler(UpstreamDatabaseError)
def handle_upstream_database_error(request: Request, exc: UpstreamDatabaseError):
    return _error_response(500, "SEAT_GENERATION_FAILED", str(exc))


@app.get("/health")
def health_check():
    return {"status": "healthy"}
