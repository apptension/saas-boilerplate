from typing import Optional

from pydantic import BaseModel


class OpenAIUsage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class OpenAIResponse(BaseModel):
    id: str
    object: str
    created: int
    usage: OpenAIUsage


class OpenAICompletionResponseChoice(BaseModel):
    text: str
    index: int
    longprobs: Optional[int]
    finish_reason: str


class OpenAICompletionResponse(OpenAIResponse):
    model: str
    choices: list[OpenAICompletionResponseChoice]
