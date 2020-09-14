from django.db import connections, DEFAULT_DB_ALIAS
from django.db.migrations.executor import MigrationExecutor
from rest_framework import response, status, views
from rest_framework import permissions


class HealthCheckView(views.APIView):
    authentication_classes = ()
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        executor = MigrationExecutor(connections[DEFAULT_DB_ALIAS])
        plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
        if plan:
            return response.Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return response.Response(status=status.HTTP_200_OK)
