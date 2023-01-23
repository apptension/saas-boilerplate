import boto3
import pytest
from django.conf import settings
from moto import mock_events


@pytest.fixture(scope='function')
def aws_events():
    with mock_events():
        client = boto3.client('events')
        client.create_event_bus(Name=settings.WORKERS_EVENT_BUS_NAME)
        yield client
