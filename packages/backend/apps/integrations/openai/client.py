import openai
from config import settings
from .types import OpenAICompletionResponse
from .exceptions import OpenAIClientException

openai.api_key = settings.OPENAI_API_KEY


OPEN_AI_API_ERROR_MSG = "OpenAI service is currently unavailable. Please try again in a couple seconds."


class OpenAIClient:
    @staticmethod
    def get_saas_ideas(keywords: list[str]) -> OpenAICompletionResponse:
        prompt = f"Get me 3-5 {', '.join(keywords)} saas ideas"

        try:
            result = openai.Completion.create(
                model=settings.OPENAI_MODEL, prompt=prompt, max_tokens=200, temperature=0.5
            )
            return OpenAICompletionResponse(**result)
        except openai.error.APIError as error:
            raise OpenAIClientException(OPEN_AI_API_ERROR_MSG) from error
