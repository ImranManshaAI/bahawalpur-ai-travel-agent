from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AgentErrorResponse(BaseModel):
    code: str
    message: str
    details: dict | None = None


class AgentChatHistoryItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)

    @field_validator("content")
    @classmethod
    def strip_content(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("History content must not be empty.")
        return stripped


class AgentChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message: str = Field(max_length=4000)
    history: list[AgentChatHistoryItem] | None = Field(default=None, max_length=20)

    @field_validator("message")
    @classmethod
    def strip_message(cls, value: str) -> str:
        return value.strip()


class AgentToolTraceItem(BaseModel):
    name: str
    ok: bool


class AgentChatData(BaseModel):
    reply: str
    tool_trace: list[AgentToolTraceItem]


class AgentChatResponse(BaseModel):
    data: AgentChatData | None = None
    error: AgentErrorResponse | None = None
