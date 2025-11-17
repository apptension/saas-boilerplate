from openai import APIError
import pytest

from apps.integrations.openai.client import OpenAIClient, OPEN_AI_API_ERROR_MSG
from apps.integrations.openai.exceptions import OpenAIClientException

pytestmark = pytest.mark.django_db


class TestOpenAIClientGetSaasIdeas:
    def test_success(self, mocker, openai_completion_mock, open_ai_completion_response_factory):
        response_data = open_ai_completion_response_factory.create()
        # Create a mock response object that mimics the new SDK structure
        mock_response = mocker.Mock()
        mock_response.id = response_data["id"]
        mock_response.object = response_data["object"]
        mock_response.created = response_data["created"]
        mock_response.model = response_data["model"]
        mock_response.choices = [
            mocker.Mock(
                text=choice["text"],
                index=choice["index"],
                logprobs=getattr(choice, 'logprobs', None),
                finish_reason=choice["finish_reason"]
            )
            for choice in response_data["choices"]
        ]
        mock_response.usage = mocker.Mock(
            prompt_tokens=response_data["usage"]["prompt_tokens"],
            completion_tokens=response_data["usage"]["completion_tokens"],
            total_tokens=response_data["usage"]["total_tokens"]
        )
        
        openai_completion_mock.return_value = mock_response
        keywords = ['fitness', 'ai']

        result = OpenAIClient.get_saas_ideas(keywords)

        openai_completion_mock.assert_called_once_with(
            model='gpt-3.5-turbo-instruct',
            prompt=mocker.ANY,  # Prompt is complex, just check it exists
            max_tokens=1000,
            temperature=0.7,
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
        openai_completion_mock.side_effect = APIError(
            message="The server had an error while processing your request.",
            request=None,
            body=None
        )

        with pytest.raises(OpenAIClientException) as error:
            OpenAIClient.get_saas_ideas(['idea'])

        assert str(error.value) == OPEN_AI_API_ERROR_MSG
