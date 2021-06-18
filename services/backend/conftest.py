import pytest
from django.contrib.auth.models import AnonymousUser
from rest_framework.test import APIClient, APIRequestFactory
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


class CustomGrapheneClient(GrapheneClient):
    def query(self, *args, **kwargs):
        self.execute_options["context_value"].method = "GET"
        return super(CustomGrapheneClient, self).execute(*args, **kwargs)

    def mutate(self, *args, **kwargs):
        self.execute_options["context_value"].method = "POST"
        return super(CustomGrapheneClient, self).execute(*args, **kwargs)

    def force_authenticate(self, user):
        self.execute_options["context_value"].user = user

    @staticmethod
    def create_context():
        request = APIRequestFactory()
        request.user = AnonymousUser()
        return request


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
    return CustomGrapheneClient(schema, context_value=CustomGrapheneClient.create_context())
