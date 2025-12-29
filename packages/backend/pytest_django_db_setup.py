"""
Custom pytest-django database setup with smart retry logic and conflict handling.

This module provides enhanced database setup that handles:
- Database lock conflicts
- Stale connection cleanup
- Retry logic for transient database errors
- Support for both sequential and parallel test execution
"""

import time
import psycopg2
from psycopg2 import sql
from django.db import connections
from django.conf import settings
from django.test.utils import get_runner


def _force_close_all_connections():
    """Force close all database connections."""
    for conn in connections.all():
        try:
            conn.close()
        except Exception:
            pass


def _terminate_idle_connections(db_name, db_config):
    """
    Terminate idle database connections to allow cleanup.
    Only terminates connections that are idle or in a transaction that can be safely terminated.
    """
    try:
        admin_conn = psycopg2.connect(
            host=db_config['HOST'],
            port=db_config['PORT'],
            user=db_config['USER'],
            password=db_config['PASSWORD'],
            database='postgres',
            connect_timeout=2,
        )
        admin_conn.autocommit = True
        cursor = admin_conn.cursor()

        # Only terminate idle connections
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
        pass


def setup_test_database_with_retry(max_retries=3, retry_delay=1):
    """
    Setup test database with retry logic for handling transient conflicts.

    Args:
        max_retries: Maximum number of retry attempts
        retry_delay: Delay between retries in seconds
    """
    db_config = settings.DATABASES['default']
    test_db_name = f"test_{db_config['NAME']}"

    for attempt in range(max_retries):
        try:
            # Close any existing connections
            _force_close_all_connections()

            # If this is a retry, clean up stale connections
            if attempt > 0:
                time.sleep(retry_delay * attempt)  # Exponential backoff
                _terminate_idle_connections(test_db_name, db_config)
                time.sleep(0.5)  # Brief pause after cleanup

            # Use Django's test runner to setup databases
            TestRunner = get_runner(settings)
            test_runner = TestRunner(verbosity=0, interactive=False, keepdb=False)
            old_config = test_runner.setup_databases()

            return old_config

        except Exception as e:
            error_msg = str(e).lower()

            # Check if it's a retryable database error
            is_retryable = any(
                keyword in error_msg
                for keyword in [
                    'database "test_backend" already exists',
                    'database "test_backend" is being accessed',
                    'objectinuse',
                    'duplicate key value violates unique constraint "pg_database_datname_index"',
                ]
            )

            if is_retryable and attempt < max_retries - 1:
                # Wait and retry
                continue
            else:
                # Not retryable or last attempt - raise the error
                raise
