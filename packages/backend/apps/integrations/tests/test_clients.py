import openai.error
import pytest

from apps.integrations.openai.client import OpenAIClient, OPEN_AI_API_ERROR_MSG
from apps.integrations.openai.exceptions import OpenAIClientException

pytestmark = pytest.mark.django_db


class TestOpenAIClientGetSaasIdeas:
    def test_success(self, mocker, openai_completion_mock, open_ai_completion_response_factory):
        response_data = open_ai_completion_response_factory.create()
        create_mock = mocker.Mock(return_value=response_data)
        openai_completion_mock.create = create_mock
        keywords = ['fitness', 'ai']

        result = OpenAIClient.get_saas_ideas(keywords)

        create_mock.assert_called_once_with(
            **{
                'max_tokens': 200,
                'model': 'gpt-3.5-turbo-instruct',
                'prompt': 'Get me 3-5 fitness, ai saas ideas',
                'temperature': 0.5,
            }
        )
        assert result.id == response_data["id"]
        assert result.object == response_data["object"]
        assert result.created == response_data["created"]
        assert result.model == response_data["model"]
        assert all(
            {
                "text": choice.text,
                "index": choice.index,
                "logprobs": choice.longprobs,
                "finish_reason": choice.finish_reason,
            }
            in response_data["choices"]
            for choice in result.choices
        )
        assert result.usage.dict() == response_data["usage"]

    def test_api_exception(self, mocker, openai_completion_mock):
        create_mock = mocker.Mock(
            side_effect=openai.error.APIError("The server had an error while processing your request.")
        )
        openai_completion_mock.create = create_mock

        with pytest.raises(OpenAIClientException) as error:
            OpenAIClient.get_saas_ideas(['idea'])

        assert str(error.value) == OPEN_AI_API_ERROR_MSG
