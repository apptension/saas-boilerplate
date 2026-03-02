from openai import OpenAI
from ..openai import client
import pytest
import pytest_factoryboy
from . import factories


pytest_factoryboy.register(factories.OpenAICompletionResponseFactory)
pytest_factoryboy.register(factories.OpenAICompletionResponseChoiceFactory)


@pytest.fixture
def openai_completion_mock(mocker):
    """Mock the OpenAI client's chat.completions.create method."""
    mock_client = mocker.Mock()
    mock_chat = mocker.Mock()
    mock_completions = mocker.Mock()
    mock_chat.completions = mock_completions
    mock_client.chat = mock_chat
    mock_client.completions = mocker.Mock()  # Also mock completions for instruct models
    mocker.patch.object(OpenAI, "__new__", return_value=mock_client)
    return mock_completions.create


@pytest.fixture
def openai_client_mock(mocker):
    return mocker.patch.object(client, "OpenAIClient", autospec=True)
