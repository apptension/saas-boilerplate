import factory

from .. import models


class WebSocketConnectionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = models.WebSocketConnection


class GraphQlSubscriptionFactory(factory.django.DjangoModelFactory):
    connection = factory.SubFactory(WebSocketConnectionFactory)
    variables = {}

    class Meta:
        model = models.GraphQLSubscription
