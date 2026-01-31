import os
import time

from config import settings
from django.db import connections, DEFAULT_DB_ALIAS, close_old_connections
from django.db.migrations.executor import MigrationExecutor
from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin
from graphql import GraphQLResolveInfo
from promise import is_thenable
from rest_framework import status
from rest_framework.exceptions import APIException
from sentry_sdk import capture_exception
from sentry_sdk import capture_message
from sentry_sdk import push_scope

from apps.users.utils import set_auth_cookie, reset_auth_cookie
from common.graphql.exceptions import GraphQlValidationError

# Only import X-Ray if tracing is enabled
TRACING_ENABLED = os.environ.get("TRACING_BACKEND", "xray") == "xray"
if TRACING_ENABLED:
    from aws_xray_sdk.core import xray_recorder


# =============================================================================
# Health Check Cache
# =============================================================================
# Cache migration check results to reduce database connection pressure.
# This is safe because migrations only change during deployments.
# Cache TTL is configurable via HEALTH_CHECK_CACHE_TTL env var (default 30s).
_health_check_cache = {
    'migrations_ok': None,  # True/False/None
    'last_check': 0,  # timestamp
}


def _check_migrations_with_cache():
    """
    Check for pending migrations with caching to reduce DB connection pressure.

    Returns:
        bool: True if no pending migrations (healthy), False otherwise

    This caches the result (default 30 seconds, configurable via HEALTH_CHECK_CACHE_TTL)
    to avoid opening a new DB connection on every health check
    (which happens every 10-30 seconds on Render).
    """
    global _health_check_cache

    cache_ttl = getattr(settings, 'HEALTH_CHECK_CACHE_TTL', 30)
    now = time.time()
    cache_age = now - _health_check_cache['last_check']

    # Return cached result if still valid
    if _health_check_cache['migrations_ok'] is not None and cache_age < cache_ttl:
        return _health_check_cache['migrations_ok']

    # Need to check migrations - this opens a DB connection
    try:
        executor = MigrationExecutor(connections[DEFAULT_DB_ALIAS])
        plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
        migrations_ok = len(plan) == 0

        # Update cache
        _health_check_cache['migrations_ok'] = migrations_ok
        _health_check_cache['last_check'] = now

        return migrations_ok
    finally:
        # CRITICAL: Close the connection immediately after the check
        # This prevents connection accumulation from health checks
        close_old_connections()


class HealthCheckMiddleware(MiddlewareMixin):
    """
    Health check middleware for load balancer probes.

    Returns 200 if the application is ready to serve requests.
    Returns 503 if there are pending migrations or the database is not ready.

    The middleware supports two modes:
    - Strict mode (default): Returns 503 if migrations are pending or DB is unavailable
    - Lenient mode: Returns 200 for simple liveness checks, only 503 for startup issues

    Use /lbcheck for readiness probes (includes migration check)
    Use /lbcheck?liveness=1 for liveness probes (simple health check, no DB check)

    Connection Management:
    - Migration check results are cached for 30 seconds to reduce DB pressure
    - Connections are explicitly closed after each migration check
    - This prevents connection exhaustion on memory-constrained databases
    """

    def process_request(self, request):
        if request.META["PATH_INFO"] == "/lbcheck":
            if TRACING_ENABLED:
                xray_recorder.begin_segment("lbcheck")

            response = HttpResponse()

            # Liveness check mode - just check if the app is running, no DB check
            # Useful for Kubernetes/container orchestration liveness probes
            if request.GET.get('liveness') == '1':
                response.status_code = status.HTTP_200_OK
                if TRACING_ENABLED:
                    xray_recorder.end_segment()
                return response

            try:
                # Check database connectivity and migrations (with caching)
                if _check_migrations_with_cache():
                    response.status_code = status.HTTP_200_OK
                else:
                    # Pending migrations - service not ready
                    response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
            except Exception as e:
                # Database not ready or connection failed
                # Log the error for debugging but don't expose details
                import logging

                logger = logging.getLogger(__name__)
                logger.warning(f"Health check failed: {type(e).__name__}: {e}")
                response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

                # Invalidate cache on error so we retry on next check
                _health_check_cache['migrations_ok'] = None
                _health_check_cache['last_check'] = 0

            if TRACING_ENABLED:
                xray_recorder.end_segment()

            return response


class SetAuthTokenCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if getattr(request, "reset_auth_cookie", False):
            reset_auth_cookie(response)

        if tokens := getattr(request, "set_auth_cookie", None):
            set_auth_cookie(response, tokens)

        return response


class SentryMiddleware(object):
    @staticmethod
    def _get_validation_error_first_detail(detail):
        if isinstance(detail, (list, dict)):
            return next(iter(detail), detail)
        return detail

    def on_error(self, error):
        with push_scope() as scope:
            if hasattr(error, 'original_error') and isinstance(error.original_error, APIException):
                capture_exception(error.original_error)
            elif isinstance(error, GraphQlValidationError):
                full_details = error.get_full_details()
                scope.set_extra('Validation errors', full_details)
                capture_message(self._get_validation_error_first_detail(error))
            else:
                capture_exception(error)
            raise error

    def resolve(self, next, root, info: GraphQLResolveInfo, **args):
        promise = next(root, info, **args)
        if is_thenable(promise):
            return promise.catch(self.on_error)
        return promise


class ManageCookiesMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Get cookie settings once, used for both set and delete operations
        cookie_secure = getattr(settings, 'COOKIE_SECURE', True)
        cookie_samesite = getattr(settings, 'COOKIE_SAMESITE', 'Lax')

        if (cookies := getattr(request, "set_cookies", None)) and response.status_code == 200:  # noqa: PLR2004
            for key, value in cookies.items():
                response.set_cookie(
                    key,
                    value,
                    max_age=settings.COOKIE_MAX_AGE,
                    httponly=True,
                    secure=cookie_secure,
                    samesite=cookie_samesite,
                )

        if delete_cookies := getattr(request, "delete_cookies", []):
            for cookie in delete_cookies:
                response.delete_cookie(cookie, samesite=cookie_samesite)

        return response
