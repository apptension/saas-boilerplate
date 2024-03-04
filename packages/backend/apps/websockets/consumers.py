import channels_graphql_ws

from config.schema import schema as graphql_schema


class DefaultGraphqlWsConsumer(channels_graphql_ws.GraphqlWsConsumer):
    """Channels WebSocket consumer which provides GraphQL API."""

    schema = graphql_schema
