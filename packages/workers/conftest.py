from uuid import UUID

import boto3
import pytest
from moto import mock_ses
from pytest_factoryboy import register

import settings
from dao.db import connection
from dao.db.models import Base
from dao.db.session import db_session as db_session_ctx
from demo import factories as demo_factories

register(demo_factories.CrudDemoItemFactory)
register(demo_factories.DocumentDemoItemFactory)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(connection.db)

    with db_session_ctx() as session:
        yield session

    Base.metadata.drop_all(bind=connection.db)


@pytest.fixture
def ses_client():
    with mock_ses():
        client = boto3.client("ses")
        client.verify_email_identity(EmailAddress=settings.FROM_EMAIL)
        yield client


@pytest.fixture
def uuid_mock(mocker):
    mocked_uuid = UUID('76697d3f-ee2f-4c23-b2a4-b54ae2fc6015')
    mocker.patch("uuid.uuid4", return_value=mocked_uuid)
    return mocked_uuid
