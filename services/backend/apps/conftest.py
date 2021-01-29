import pytest
from rest_framework.test import APIClient
from moto import mock_events
import boto3
from django.conf import settings


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture(autouse=True)
def workers_event_bus():
    with mock_events():
        client = boto3.client('events')
        client.create_event_bus(Name=settings.WORKERS_EVENT_BUS_NAME)
        yield client
