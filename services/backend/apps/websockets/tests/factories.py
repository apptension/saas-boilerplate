import factory

from .. import models


class WebSocketConnectionFactory(factory.DjangoModelFactory):
    class Meta:
        model = models.WebSocketConnection


class GraphQlSubscriptionFactory(factory.DjangoModelFactory):
    connection = factory.SubFactory(WebSocketConnectionFactory)
    variables = {}

    class Meta:
        model = models.GraphQLSubscription
