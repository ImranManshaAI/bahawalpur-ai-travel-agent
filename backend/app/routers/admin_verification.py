from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends
from psycopg.errors import RaiseException

from app.core.auth import require_admin
from app.schemas.admin_verification import (
    AdminBookingListResponse,
    AdminErrorResponse,
    AdminPaymentProofListResponse,
    AdminRejectRequest,
    AdminReviewResponse,
)
from app.services.admin_verification import (
    ConfirmNotAllowedError,
    InvalidFilterError,
    ProofNotFoundError,
    ProofNotPendingError,
    SeatsNotHeldError,
    classify_review_failure,
    confirm_payment_proof,
    list_admin_bookings,
    list_payment_proofs,
    reject_payment_proof,
)

router = APIRouter(prefix="/admin", tags=["Admin Verification"])


def _error(code: str, message: str) -> dict:
    return {"code": code, "message": message, "details": None}


@router.get("/payment-proofs", response_model=AdminPaymentProofListResponse)
def get_payment_proofs(
    status: str = "pending_verification",
    _admin: dict = Depends(require_admin),
):
    try:
        results = list_payment_proofs(status)
    except InvalidFilterError as exc:
        return AdminPaymentProofListResponse(
            data=None,
            error=AdminErrorResponse(code="INVALID_STATUS", message=str(exc), details=None),
        )

    return AdminPaymentProofListResponse(
        data=[
            {
                **item,
                "total_price": float(item["total_price"]),
                "amount_claimed": (
                    float(item["amount_claimed"]) if item["amount_claimed"] is not None else None
                ),
            }
            for item in results
        ],
        error=None,
    )


@router.get("/bookings", response_model=AdminBookingListResponse)
def get_admin_bookings(
    date: date | None = None,
    status: str | None = None,
    _admin: dict = Depends(require_admin),
):
    try:
        results = list_admin_bookings(travel_date=date, booking_status=status)
    except InvalidFilterError as exc:
        return AdminBookingListResponse(
            data=None,
            error=AdminErrorResponse(code="INVALID_STATUS", message=str(exc), details=None),
        )

    return AdminBookingListResponse(
        data=[
            {
                **item,
                "total_price": float(item["total_price"]),
            }
            for item in results
        ],
        error=None,
    )


@router.post("/payment-proofs/{proof_id}/confirm", response_model=AdminReviewResponse)
def confirm_proof(
    proof_id: UUID,
    admin: dict = Depends(require_admin),
):
    try:
        result = confirm_payment_proof(proof_id, reviewed_by=admin["admin_id"])
    except ProofNotFoundError as exc:
        return AdminReviewResponse(data=None, error=_error("PROOF_NOT_FOUND", str(exc)))
    except ProofNotPendingError as exc:
        return AdminReviewResponse(data=None, error=_error("PROOF_NOT_PENDING", str(exc)))
    except ConfirmNotAllowedError as exc:
        return AdminReviewResponse(data=None, error=_error("CONFIRM_NOT_ALLOWED", str(exc)))
    except SeatsNotHeldError as exc:
        return AdminReviewResponse(data=None, error=_error("SEATS_NOT_HELD", str(exc)))
    except RaiseException as exc:
        code, message = classify_review_failure(str(exc), "confirm")
        return AdminReviewResponse(data=None, error=_error(code, message))

    return AdminReviewResponse(data=result, error=None)


@router.post("/payment-proofs/{proof_id}/reject", response_model=AdminReviewResponse)
def reject_proof(
    proof_id: UUID,
    request: AdminRejectRequest = AdminRejectRequest(),
    admin: dict = Depends(require_admin),
):
    reason = request.reason

    try:
        result = reject_payment_proof(
            proof_id,
            reviewed_by=admin["admin_id"],
            reason=reason,
        )
    except ProofNotFoundError as exc:
        return AdminReviewResponse(data=None, error=_error("PROOF_NOT_FOUND", str(exc)))
    except ProofNotPendingError as exc:
        return AdminReviewResponse(data=None, error=_error("PROOF_NOT_PENDING", str(exc)))
    except ConfirmNotAllowedError as exc:
        return AdminReviewResponse(data=None, error=_error("CONFIRM_NOT_ALLOWED", str(exc)))
    except SeatsNotHeldError as exc:
        return AdminReviewResponse(data=None, error=_error("SEATS_NOT_HELD", str(exc)))
    except RaiseException as exc:
        code, message = classify_review_failure(str(exc), "reject")
        return AdminReviewResponse(data=None, error=_error(code, message))

    return AdminReviewResponse(data=result, error=None)
