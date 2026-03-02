from openai import APIError, OpenAI
import pytest
from unittest.mock import patch, Mock

from apps.integrations.openai.client import OpenAIClient, OPEN_AI_API_ERROR_MSG
from apps.integrations.openai.exceptions import OpenAIClientException

pytestmark = pytest.mark.django_db


class TestOpenAIClientGetSaasIdeas:
    @patch('apps.integrations.openai.client.settings')
    @patch.object(OpenAI, '__new__')
    def test_success(self, mock_openai_new, mock_settings, open_ai_completion_response_factory):
        OpenAIClient._client = None
        mock_settings.OPENAI_API_KEY = 'sk-test-key'
        mock_settings.OPENAI_MODEL = 'gpt-3.5-turbo'

        response_data = open_ai_completion_response_factory.create()
        mock_response = Mock()
        mock_response.choices = [
            Mock(
                message=Mock(content=choice["text"]),
                index=choice["index"],
                finish_reason=choice["finish_reason"],
            )
            for choice in response_data["choices"]
        ]

        mock_client = Mock()
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai_new.return_value = mock_client

        keywords = ['fitness', 'ai']
        result = OpenAIClient.get_saas_ideas(keywords)

        assert mock_client.chat.completions.create.called
        assert isinstance(result, str)
        assert len(result) > 0

    @patch('apps.integrations.openai.client.settings')
    @patch.object(OpenAI, '__new__')
    def test_api_exception(self, mock_openai_new, mock_settings):
        OpenAIClient._client = None
        mock_settings.OPENAI_API_KEY = 'sk-test-key'
        mock_settings.OPENAI_MODEL = 'gpt-3.5-turbo'

        api_error = APIError(message="The server had an error while processing your request.", request=None, body=None)

        mock_client = Mock()
        mock_client.chat.completions.create.side_effect = api_error
        mock_openai_new.return_value = mock_client

        with pytest.raises(OpenAIClientException) as error:
            OpenAIClient.get_saas_ideas(['idea'])

        assert str(error.value) == OPEN_AI_API_ERROR_MSG
