import graphene

from apps.demo import schema as demo_schema
from common.graphql.utils import graphql_query, graphql_mutation

schema = graphene.Schema(query=graphql_query([demo_schema.Query]), mutation=graphql_mutation([demo_schema.Mutation]))
