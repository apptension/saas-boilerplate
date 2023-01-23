import pytest_factoryboy

from . import factories

pytest_factoryboy.register(factories.WebSocketConnectionFactory)
pytest_factoryboy.register(factories.GraphQlSubscriptionFactory)
