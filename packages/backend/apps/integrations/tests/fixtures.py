import openai
from ..openai import client
import pytest
import pytest_factoryboy
from . import factories


pytest_factoryboy.register(factories.OpenAICompletionResponseFactory)
pytest_factoryboy.register(factories.OpenAICompletionResponseChoiceFactory)


@pytest.fixture
def openai_completion_mock(mocker):
    return mocker.patch.object(openai, "Completion", autospec=True)


@pytest.fixture
def openai_client_mock(mocker):
    return mocker.patch.object(client, "OpenAIClient", autospec=True)
