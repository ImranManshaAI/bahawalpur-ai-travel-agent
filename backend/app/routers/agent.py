from fastapi import APIRouter

from app.schemas.agent import AgentChatRequest, AgentChatResponse, AgentErrorResponse
from app.services.agent import AssistantUnavailableError, run_chat

router = APIRouter(prefix="/agent", tags=["Agent"])

_INVALID_REQUEST = AgentErrorResponse(
    code="INVALID_REQUEST",
    message="A message is required.",
    details=None,
)
_ASSISTANT_UNAVAILABLE = AgentErrorResponse(
    code="ASSISTANT_UNAVAILABLE",
    message="The travel assistant is temporarily unavailable.",
    details=None,
)
_INTERNAL_ERROR = AgentErrorResponse(
    code="INTERNAL_ERROR",
    message="The request could not be completed. Please try again.",
    details=None,
)


@router.post("/chat", response_model=AgentChatResponse, status_code=200)
def agent_chat(request: AgentChatRequest):
    if not request.message:
        return AgentChatResponse(data=None, error=_INVALID_REQUEST)

    history = None
    if request.history is not None:
        history = [item.model_dump() for item in request.history]

    try:
        result = run_chat(message=request.message, history=history)
    except AssistantUnavailableError:
        return AgentChatResponse(data=None, error=_ASSISTANT_UNAVAILABLE)
    except ValueError:
        return AgentChatResponse(data=None, error=_INVALID_REQUEST)
    except Exception:
        return AgentChatResponse(data=None, error=_INTERNAL_ERROR)

    return AgentChatResponse(data=result, error=None)
