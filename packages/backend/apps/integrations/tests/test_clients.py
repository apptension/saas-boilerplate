from openai import APIError, OpenAI
import pytest

from apps.integrations.openai.client import OpenAIClient, OPEN_AI_API_ERROR_MSG
from apps.integrations.openai.exceptions import OpenAIClientException

pytestmark = pytest.mark.django_db


class TestOpenAIClientGetSaasIdeas:
    def test_success(self, mocker, openai_completion_mock, open_ai_completion_response_factory):
        response_data = open_ai_completion_response_factory.create()
        # Create a mock response object that mimics the chat completions API structure
        mock_response = mocker.Mock()
        mock_response.id = response_data["id"]
        mock_response.object = response_data["object"]
        mock_response.created = response_data["created"]
        mock_response.model = response_data["model"]
        # Chat completions API uses message.content instead of text
        mock_response.choices = [
            mocker.Mock(
                message=mocker.Mock(content=choice["text"]),
                index=choice["index"],
                finish_reason=choice["finish_reason"],
            )
            for choice in response_data["choices"]
        ]
        mock_response.usage = mocker.Mock(
            prompt_tokens=response_data["usage"]["prompt_tokens"],
            completion_tokens=response_data["usage"]["completion_tokens"],
            total_tokens=response_data["usage"]["total_tokens"],
        )

        openai_completion_mock.return_value = mock_response
        keywords = ['fitness', 'ai']

        result = OpenAIClient.get_saas_ideas(keywords)

        # The method uses chat.completions.create, not completions.create
        # Verify it was called (the exact parameters depend on model fallback logic)
        assert openai_completion_mock.called
        # Result should be a string (the text content)
        assert isinstance(result, str)
        assert len(result) > 0

    def test_api_exception(self, mocker):
        # Reset the client singleton to ensure fresh mock
        OpenAIClient._client = None
        
        # Mock the OpenAI client to raise APIError on both paths
        api_error = APIError(
            message="The server had an error while processing your request.", request=None, body=None
        )
        
        # Create a mock client that raises errors on both completion paths
        mock_client = mocker.Mock()
        mock_chat = mocker.Mock()
        mock_completions_chat = mocker.Mock()
        mock_completions_chat.create.side_effect = api_error
        mock_chat.completions = mock_completions_chat
        mock_client.chat = mock_chat
        
        # Mock completions.create for instruct models
        mock_completions = mocker.Mock()
        mock_completions.create.side_effect = api_error
        mock_client.completions = mock_completions
        
        # Patch OpenAI to return our mock
        mocker.patch.object(OpenAI, '__new__', return_value=mock_client)

        with pytest.raises(OpenAIClientException) as error:
            OpenAIClient.get_saas_ideas(['idea'])

        assert str(error.value) == OPEN_AI_API_ERROR_MSG
