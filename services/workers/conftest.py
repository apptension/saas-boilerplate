import boto3
import pytest
from moto import mock_ses
from pytest_factoryboy import register

import settings
from dao.db import connection
from dao.db.models import Base
from dao.db.session import db_session as db_session_ctx
from userauth import factories as ua_factories

register(ua_factories.UserFactory)


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
