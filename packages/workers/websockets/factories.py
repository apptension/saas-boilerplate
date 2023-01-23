import factory

from dao.db import session
from . import models


class WebSocketConnectionFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = models.WebSocketConnection
        sqlalchemy_session = session.Session


class GraphQLSubscriptionFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = models.GraphQLSubscription
        sqlalchemy_session = session.Session

    connection = factory.SubFactory(WebSocketConnectionFactory)
