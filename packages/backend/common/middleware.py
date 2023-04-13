from aws_xray_sdk.core import xray_recorder
from config import settings
from django.db import connections, DEFAULT_DB_ALIAS
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


class HealthCheckMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.META["PATH_INFO"] == "/lbcheck":
            xray_recorder.begin_segment()
            response = HttpResponse()

            executor = MigrationExecutor(connections[DEFAULT_DB_ALIAS])
            plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
            if plan:
                response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
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

        if (cookies := getattr(request, "set_cookies", None)) and response.status_code == 200:  # noqa: PLR2004
            for key, value in cookies.items():
                response.set_cookie(key, value, max_age=settings.COOKIE_MAX_AGE, httponly=True)

        if delete_cookies := getattr(request, "delete_cookies", []):
            for cookie in delete_cookies:
                response.delete_cookie(cookie)

        return response
