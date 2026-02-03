import graphene
from common.graphql import ratelimit
from .openai import client


class GenerateSaasIdeasMutation(graphene.relay.ClientIDMutation):
    class Input:
        keywords = graphene.List(graphene.String)

    response = graphene.String()

    @classmethod
    @ratelimit.ratelimit(key="ip", rate="3/min")
    def mutate_and_get_payload(cls, root, info, keywords):
        # Get raw text response from OpenAI
        try:
            response_text = client.OpenAIClient.get_saas_ideas(keywords)
        except client.OpenAIClientException as e:
            raise Exception(str(e))

        return cls(response=response_text)


class Mutation(graphene.ObjectType):
    generate_saas_ideas = GenerateSaasIdeasMutation.Field()
