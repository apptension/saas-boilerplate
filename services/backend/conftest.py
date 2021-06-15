import pytest
from rest_framework.test import APIClient
from graphene.test import Client as GrapheneClient

from config.schema import schema

pytest_plugins = [
    'tests.aws_fixtures',
    'common.tests.fixtures',
    'apps.users.tests.fixtures',
    'apps.finances.tests.fixtures',
    'apps.demo.tests.fixtures',
    'apps.content.tests.fixtures',
    'apps.notifications.tests.fixtures',
]


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def api_client_admin():
    client = APIClient()
    client.defaults.setdefault('SERVER_NAME', 'admin.example.org')
    return client


@pytest.fixture
def graphene_client():
    return GrapheneClient(schema)


@pytest.fixture
def graphene_client_with_context(user_factory):
    def _graphene_client_with_context(context=None):
        if not context:

            class DefaultContext:
                user = user_factory()

            context = DefaultContext()
        return GrapheneClient(schema, context_value=context)

    return _graphene_client_with_context
