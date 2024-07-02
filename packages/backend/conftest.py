from functools import lru_cache
from unittest.mock import patch, PropertyMock

import boto3
import pytest
from django.contrib.auth.models import AnonymousUser
from rest_framework.test import APIClient, APIRequestFactory
from graphene.test import Client as GrapheneClient
from moto import mock_s3
from django.conf import settings

from common.graphql.views import DRFAuthenticatedGraphQLView
from config.schema import schema
from storages.backends.s3boto3 import S3Boto3Storage

pytest_plugins = [
    'celery.contrib.pytest',
    'tests.aws_fixtures',
    'common.tests.fixtures',
    'apps.users.tests.fixtures',
    'apps.finances.tests.fixtures',
    'apps.demo.tests.fixtures',
    'apps.content.tests.fixtures',
    'apps.notifications.tests.fixtures',
    'apps.integrations.tests.fixtures',
    'apps.multitenancy.tests.fixtures',
]


class CustomGrapheneClient(GrapheneClient):
    def __init__(self, schema, **execute_options):
        super().__init__(schema, format_error=DRFAuthenticatedGraphQLView.format_error, **execute_options)

    def query(self, *args, **kwargs):
        self.execute_options["context_value"].method = "GET"
        return super(CustomGrapheneClient, self).execute(*args, **kwargs)

    def mutate(self, *args, **kwargs):
        self.execute_options["context_value"].method = "POST"
        return super(CustomGrapheneClient, self).execute(*args, **kwargs)

    def force_authenticate(self, user):
        self.execute_options["context_value"].user = user

    def set_tenant_dependent_context(self, tenant, role):
        self.execute_options["context_value"].tenant = tenant
        self.execute_options["context_value"].user_role = role

    def set_cookies(self, cookies):
        self.execute_options["context_value"].cookies = cookies
        self.execute_options["context_value"].COOKIES = {morsel.key: morsel.coded_value for morsel in cookies.values()}

    @staticmethod
    def create_context():
        request = APIRequestFactory()
        request.user = AnonymousUser()
        request.META = {"REMOTE_ADDR": '0.0.0.0'}  # noqa: S104
        request._request = request

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


@pytest.fixture(autouse=True)
def storage(mocker):
    bucket_name = "test-bucket"
    with mock_s3():
        storage = S3Boto3Storage()
        session = boto3.session.Session()
        with patch(
            "storages.backends.s3boto3.S3Boto3Storage.connection",
            new_callable=PropertyMock,
        ) as mock_connection_property, patch(
            "storages.backends.s3boto3.S3Boto3Storage.bucket",
            new_callable=PropertyMock,
        ) as mock_bucket_property:

            @lru_cache(None)
            def get_connection():
                return session.resource("s3")

            @lru_cache(None)
            def get_bucket():
                connection = get_connection()
                connection.create_bucket(
                    Bucket=bucket_name,
                    CreateBucketConfiguration={"LocationConstraint": "eu-ewst-1"},
                )
                bucket = connection.Bucket(bucket_name)
                return bucket

            mock_connection_property.side_effect = get_connection
            mock_bucket_property.side_effect = get_bucket
            yield storage


@pytest.fixture
def s3_exports_bucket():
    with mock_s3():
        s3 = boto3.client("s3", region_name='us-east-1', endpoint_url=settings.AWS_S3_ENDPOINT_URL)
        s3.create_bucket(Bucket=settings.AWS_EXPORTS_STORAGE_BUCKET_NAME)
        yield
