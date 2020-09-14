import pytest
import pytest_factoryboy
from rest_framework.test import APIClient

from . import factories


@pytest.fixture
def api_client():
    return APIClient()


pytest_factoryboy.register(factories.UserFactory)
pytest_factoryboy.register(factories.UserProfileFactory)
