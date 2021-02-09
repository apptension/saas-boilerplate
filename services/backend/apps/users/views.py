from django.contrib.auth import REDIRECT_FIELD_NAME
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt import views as jwt_views, tokens as jwt_tokens
from social_core.actions import do_complete
from social_django.utils import psa

from common.acl import policies
from . import serializers, utils


class SignUpView(generics.CreateAPIView):
    permission_classes = (policies.IsAnonymousFullAccess,)
    serializer_class = serializers.UserSignupSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        response = Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        utils.set_auth_cookie(response, serializer.data)
        return response


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (policies.UserFullAccess,)
    serializer_class = serializers.UserProfileSerializer

    def get_object(self):
        return self.request.user.profile


class UserAccountConfirmationView(generics.CreateAPIView):
    permission_classes = (policies.AnyoneFullAccess,)
    serializer_class = serializers.UserAccountConfirmationSerializer


class UserAccountChangePasswordView(generics.CreateAPIView):
    """ "Change the password of logged in user.

    post:
    Request to change the password of the user, it requires to provide *old_password* and *new_password*
    parameters.
    """

    permission_classes = (policies.UserFullAccess,)
    serializer_class = serializers.UserAccountChangePasswordSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        response = Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        utils.set_auth_cookie(response, serializer.data)
        return response


class PasswordResetView(generics.CreateAPIView):
    """ "Reset the user's password.

    post:
    Request to reset the user password. It will generate a token for the confirmation e-mail.
    """

    throttle_classes = (AnonRateThrottle,)
    permission_classes = (policies.AnyoneFullAccess,)
    serializer_class = serializers.PasswordResetSerializer


class PasswordResetConfirmationView(generics.CreateAPIView):
    """Confirm the new password after reset

    post:
    Set new password, it requires to provide the new password to set.
    """

    permission_classes = (policies.AnyoneFullAccess,)
    serializer_class = serializers.PasswordResetConfirmationSerializer


class LogoutView(generics.GenericAPIView):
    permission_classes = (policies.IsAuthenticatedFullAccess,)

    def post(self, request, *args, **kwargs):
        response = Response(status=status.HTTP_200_OK)
        utils.reset_auth_cookie(response)
        return response


class CookieTokenObtainPairView(jwt_views.TokenObtainPairView):
    def finalize_response(self, request, response, *args, **kwargs):
        utils.set_auth_cookie(response, response.data)
        return super().finalize_response(request, response, *args, **kwargs)


class CookieTokenRefreshView(jwt_views.TokenRefreshView):
    serializer_class = serializers.CookieTokenRefreshSerializer

    def finalize_response(self, request, response, *args, **kwargs):
        utils.set_auth_cookie(response, response.data)
        return super().finalize_response(request, response, *args, **kwargs)


@never_cache
@csrf_exempt
@psa('social:complete')
def complete(request, backend, *args, **kwargs):
    """Authentication complete view"""

    def _do_login(backend, user, social_user):
        user.backend = '{0}.{1}'.format(backend.__module__, backend.__class__.__name__)
        token = jwt_tokens.RefreshToken.for_user(user)
        backend.strategy.set_jwt(token)

    return do_complete(
        request.backend,
        _do_login,
        user=request.user,
        redirect_name=REDIRECT_FIELD_NAME,
        request=request,
        *args,
        **kwargs
    )
