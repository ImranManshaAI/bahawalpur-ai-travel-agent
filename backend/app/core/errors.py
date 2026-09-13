"""Generic, HTTP-framework-agnostic exception types.

Services raise these instead of a raw ``HTTPException`` so the service layer
stays independent of FastAPI. ``app/main.py`` maps each one to the
appropriate HTTP status code and the project's ``{data, error}`` response
envelope.

These are intentionally generic (not schedule-specific) so later phases
(booking creation, admin payment verification, ...) can reuse the same
mapping instead of duplicating it.
"""


class NotFoundError(Exception):
    """The requested resource does not exist."""


class ConflictError(Exception):
    """The request conflicts with an existing resource (e.g. a duplicate)."""


class InvalidReferenceError(Exception):
    """The request references another resource that does not exist."""


class UpstreamDatabaseError(Exception):
    """An authoritative database function/constraint rejected the operation
    for a reason that is not a simple client mistake (data-integrity failure)."""
