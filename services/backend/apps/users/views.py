from django.contrib.auth import REDIRECT_FIELD_NAME
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics
from rest_framework import permissions
from rest_framework.throttling import AnonRateThrottle
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from social_core.actions import do_complete
from social_django.utils import psa

from . import serializers


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
    """ "Change the password of logged in user.

    post:
    Request to change the password of the user, it requires to provide *old_password* and *new_password*
    parameters.
    """

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.UserAccountChangePasswordSerializer


class PasswordResetView(generics.CreateAPIView):
    """ "Reset the user's password.

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


@never_cache
@csrf_exempt
@psa('social:complete')
def complete(request, backend, *args, **kwargs):
    """Authentication complete view"""

    def _do_login(backend, user, social_user):
        user.backend = '{0}.{1}'.format(backend.__module__, backend.__class__.__name__)

        payload = JSONWebTokenAuthentication.jwt_create_payload(user)
        token = JSONWebTokenAuthentication.jwt_encode_payload(payload)
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
