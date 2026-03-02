from functools import lru_cache
from unittest.mock import patch, PropertyMock
import time
import psycopg2
from psycopg2 import sql

import boto3
import pytest
from django.contrib.auth.models import AnonymousUser
from django.db import connections
from rest_framework.test import APIClient, APIRequestFactory
from graphene.test import Client as GrapheneClient
from moto import mock_s3
from django.conf import settings


from common.graphql.views import DRFAuthenticatedGraphQLView
from config.schema import schema
from storages.backends.s3boto3 import S3Boto3Storage

pytest_plugins = [
    "celery.contrib.pytest",
    "tests.aws_fixtures",
    "common.tests.fixtures",
    "apps.users.tests.fixtures",
    "apps.finances.tests.fixtures",
    "apps.demo.tests.fixtures",
    "apps.content.tests.fixtures",
    "apps.notifications.tests.fixtures",
    "apps.integrations.tests.fixtures",
    "apps.multitenancy.tests.fixtures",
    "apps.sso.tests.fixtures",
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
        request.META = {"REMOTE_ADDR": "0.0.0.0"}  # noqa: S104
        request._request = request

        return request


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def api_client_admin():
    client = APIClient()
    client.defaults.setdefault("SERVER_NAME", "admin.example.org")
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
        with (
            patch(
                "storages.backends.s3boto3.S3Boto3Storage.connection",
                new_callable=PropertyMock,
            ) as mock_connection_property,
            patch(
                "storages.backends.s3boto3.S3Boto3Storage.bucket",
                new_callable=PropertyMock,
            ) as mock_bucket_property,
        ):

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
        s3 = boto3.client("s3", region_name="us-east-1", endpoint_url=settings.AWS_S3_ENDPOINT_URL)
        s3.create_bucket(Bucket=settings.AWS_EXPORTS_STORAGE_BUCKET_NAME)
        yield


def _force_close_all_connections():
    """Force close all database connections."""
    for conn in connections.all():
        try:
            conn.close()
        except Exception:
            pass


def _terminate_other_connections(db_name, db_config, max_wait_seconds=5):
    """
    Terminate other database connections to allow cleanup.
    Only terminates connections that are idle or in a transaction that can be safely terminated.
    This is safe in test environments.
    """
    try:
        # Connect to postgres database (not the test database) to terminate connections
        admin_conn = psycopg2.connect(
            host=db_config["HOST"],
            port=db_config["PORT"],
            user=db_config["USER"],
            password=db_config["PASSWORD"],
            database="postgres",  # Connect to postgres database
            connect_timeout=2,
        )
        admin_conn.autocommit = True
        cursor = admin_conn.cursor()

        # First, try to gracefully close connections by setting statement_timeout
        # Then terminate only connections that are idle or blocking
        cursor.execute(
            sql.SQL(
                """
                SELECT pg_terminate_backend(pg_stat_activity.pid)
                FROM pg_stat_activity
                WHERE pg_stat_activity.datname = %s
                AND pid <> pg_backend_pid()
                AND state IN ('idle', 'idle in transaction', 'idle in transaction (aborted)')
            """
            ),
            [db_name],
        )
        cursor.close()
        admin_conn.close()
    except Exception:
        # If we can't terminate connections, that's okay - we'll try other methods
        pass


@pytest.fixture(scope="function", autouse=True)
def close_db_connections():
    """
    Ensure database connections are properly closed after each test.
    This helps prevent database lock issues when running tests sequentially or in parallel.

    The fixture:
    1. Closes all Django database connections after each test
    2. Ensures no stale connections block subsequent tests
    3. Works with both --reuse-db and --create-db modes
    """
    yield
    # Close all database connections after each test
    # This is critical for preventing "database is being accessed" errors
    _force_close_all_connections()


@pytest.fixture(scope="session", autouse=True)
def django_db_setup_cleanup(django_db_setup, django_db_blocker):
    """
    Enhanced database setup with smart cleanup.
    Handles database conflicts gracefully for both sequential and parallel execution.
    """
    # Before setup, ensure clean state
    try:
        _force_close_all_connections()
    except Exception:
        pass

    yield

    # Cleanup after all tests complete
    _force_close_all_connections()

    # Final cleanup - only terminate idle connections
    try:
        db_config = settings.DATABASES["default"]
        test_db_name = f"test_{db_config['NAME']}"

        # Wait a bit for any lingering connections to close naturally
        time.sleep(0.5)

        # Only terminate idle connections that might be blocking cleanup
        _terminate_other_connections(test_db_name, db_config)

        # Final cleanup
        _force_close_all_connections()
    except Exception:
        # If cleanup fails, that's okay - it's just a test database
        pass


def pytest_configure(config):
    """
    Pytest configuration hook.
    Pre-cleanup any stale database connections before pytest-django starts.
    Only runs cleanup, doesn't terminate active connections.
    """
    # Only run if we're actually using django_db
    if config.pluginmanager.hasplugin("django"):
        try:
            # Just close our own connections, don't terminate others
            _force_close_all_connections()
        except Exception:
            # If pre-cleanup fails, continue anyway
            pass


def pytest_runtest_setup(item):
    """
    Called before each test runs.
    Ensures database connections are clean before test execution.
    """
    # Close any stale connections before each test
    try:
        _force_close_all_connections()
    except Exception:
        pass


def pytest_runtest_teardown(item):
    """
    Called after each test completes.
    Ensures database connections are properly closed.
    """
    # Close connections after each test
    try:
        _force_close_all_connections()
    except Exception:
        pass
