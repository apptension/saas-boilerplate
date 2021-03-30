import pytest
from rest_framework.test import APIClient

pytest_plugins = [
    'tests.aws_fixtures',
    'common.tests.fixtures',
    'apps.users.tests.fixtures',
    'apps.finances.tests.fixtures',
    'apps.demo.tests.fixtures',
    'apps.content.tests.fixtures',
]


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def api_client_admin():
    client = APIClient()
    client.defaults.setdefault('SERVER_NAME', 'admin.example.org')
    return client
