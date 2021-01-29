from django.db import connections, DEFAULT_DB_ALIAS
from django.db.migrations.executor import MigrationExecutor
from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework import status


class HealthCheckMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.META["PATH_INFO"] == "/lbcheck":
            response = HttpResponse()

            executor = MigrationExecutor(connections[DEFAULT_DB_ALIAS])
            plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
            if plan:
                response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

            return response
