import boto3
import pytest
import pytest_factoryboy
from django.conf import settings
from moto import mock_events
from rest_framework.test import APIClient

from apps.content.tests import factories as content_factories
from apps.demo.tests import factories as demo_factories
from apps.users.tests import factories as user_factories
from apps.finances.tests import factories as finances_factories

# Content Factories
pytest_factoryboy.register(content_factories.ContentfulDemoItemFactory)

# Demo Factories
pytest_factoryboy.register(demo_factories.ContentfulDemoItemFavoriteFactory)

# User Factories
pytest_factoryboy.register(user_factories.GroupFactory)
pytest_factoryboy.register(user_factories.UserFactory)
pytest_factoryboy.register(user_factories.UserProfileFactory)

# Finances factories
pytest_factoryboy.register(finances_factories.CustomerFactory)
pytest_factoryboy.register(finances_factories.BalanceTransactionFactory)
pytest_factoryboy.register(finances_factories.ChargeFactory)
pytest_factoryboy.register(finances_factories.PaymentIntentFactory)
pytest_factoryboy.register(finances_factories.PaymentMethodFactory)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def api_client_admin():
    client = APIClient()
    client.defaults.setdefault('SERVER_NAME', 'admin.example.org')
    return client


@pytest.fixture(scope='function', autouse=True)
def aws_events():
    with mock_events():
        client = boto3.client('events')
        client.create_event_bus(Name=settings.WORKERS_EVENT_BUS_NAME)
        yield client
