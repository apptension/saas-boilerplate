import pytest

import pytest_factoryboy

from . import factories

pytest_factoryboy.register(factories.WebSocketConnectionFactory)
pytest_factoryboy.register(factories.GraphQlSubscriptionFactory)


@pytest.fixture
def post_to_connection(mocker):
    return mocker.patch("apps.websockets.apigateway.post_to_connection")
