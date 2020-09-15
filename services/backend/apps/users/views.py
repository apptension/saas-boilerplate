from django.db import connections, DEFAULT_DB_ALIAS
from django.db.migrations.executor import MigrationExecutor
from rest_framework import generics, response, status, views
from rest_framework import permissions
from rest_framework.throttling import AnonRateThrottle

from . import serializers


class HealthCheckView(views.APIView):
    authentication_classes = ()
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        executor = MigrationExecutor(connections[DEFAULT_DB_ALIAS])
        plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
        if plan:
            return response.Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return response.Response(status=status.HTTP_200_OK)


class SignUpView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.UserSignupSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = serializers.UserProfileSerializer

    def get_object(self):
        return self.request.user.profile


class UserAccountConfirmationView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.UserAccountConfirmationSerializer


class UserAccountChangePasswordView(generics.CreateAPIView):
    """"Change the password of logged in user.

    post:
    Request to change the password of the user, it requires to provide *old_password* and *new_password*
    parameters.
    """

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.UserAccountChangePasswordSerializer


class PasswordResetView(generics.CreateAPIView):
    """"Reset the user's password.

    post:
    Request to reset the user password. It will generate a token for the confirmation e-mail.
    """

    throttle_classes = (AnonRateThrottle,)
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.PasswordResetSerializer


class PasswordResetConfirmationView(generics.CreateAPIView):
    """Confirm the new password after reset

    post:
    Set new password, it requires to provide the new password to set.
    """

    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.PasswordResetConfirmationSerializer
