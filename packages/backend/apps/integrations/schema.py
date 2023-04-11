import graphene
from common.graphql import ratelimit
from .openai import client


class GenerateSaasIdeasMutation(graphene.relay.ClientIDMutation):
    class Input:
        keywords = graphene.List(graphene.String)

    ideas = graphene.List(graphene.String)

    @classmethod
    @ratelimit.ratelimit(key="ip", rate='3/min')
    def mutate_and_get_payload(cls, root, info, keywords):
        result = client.OpenAIClient.get_saas_ideas(keywords)
        ideas = [idea for idea in result.choices[0].text.strip().split("\n\n")]
        return cls(ideas=ideas)


class Mutation(graphene.ObjectType):
    generate_saas_ideas = GenerateSaasIdeasMutation.Field()
