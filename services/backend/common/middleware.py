from django.db import connections, DEFAULT_DB_ALIAS
from django.db.migrations.executor import MigrationExecutor
from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework import status
from aws_xray_sdk.core import xray_recorder

from apps.users.utils import set_auth_cookie, reset_auth_cookie


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
