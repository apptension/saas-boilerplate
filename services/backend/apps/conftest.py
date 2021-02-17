import boto3
import pytest
import pytest_factoryboy
from django.conf import settings
from moto import mock_events
from rest_framework.test import APIClient

from apps.content.tests import factories as content_factories
from apps.users.tests import factories as user_factories

pytest_factoryboy.register(content_factories.ContentfulDemoItemFactory)
pytest_factoryboy.register(user_factories.GroupFactory)
pytest_factoryboy.register(user_factories.UserFactory)
pytest_factoryboy.register(user_factories.UserProfileFactory)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture(autouse=True)
def workers_event_bus():
    with mock_events():
        client = boto3.client('events')
        client.create_event_bus(Name=settings.WORKERS_EVENT_BUS_NAME)
        yield client
