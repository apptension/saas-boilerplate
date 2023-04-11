import openai

import pytest
from apps.integrations.openai.types import OpenAICompletionResponse
from apps.integrations.openai.client import OPEN_AI_API_ERROR_MSG

pytestmark = pytest.mark.django_db


class TestGenerateSaasIdeasMutation:
    MUTATION = """
        mutation($input: GenerateSaasIdeasMutationInput!)  {
          generateSaasIdeas(input: $input) {
            ideas
          }
        }
    """

    @pytest.fixture
    def input_data(self) -> dict:
        return {"keywords": ["ai", "fitness"]}

    def test_failure_for_not_authorized_user(self, graphene_client, input_data, openai_client_mock):
        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={"input": input_data},
        )

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == "permission_denied"
        openai_client_mock.get_saas_ideas.assert_not_called()

    def test_failure_for_open_api_exception(self, graphene_client, user, input_data, openai_completion_mock):
        openai_completion_mock.create.side_effect = openai.error.APIError(
            "The server had an error while processing your request."
        )

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={"input": input_data},
        )

        assert executed['errors'][0]['message'] == OPEN_AI_API_ERROR_MSG

    def test_success(self, graphene_client, user, input_data, openai_client_mock, open_ai_completion_response_factory):
        response_mock = OpenAICompletionResponse(**open_ai_completion_response_factory.create())
        openai_client_mock.get_saas_ideas.return_value = response_mock

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={"input": input_data},
        )

        openai_client_mock.get_saas_ideas.assert_called_once_with(input_data['keywords'])
        assert all(choice.text in executed["data"]['generateSaasIdeas']['ideas'] for choice in response_mock.choices)
