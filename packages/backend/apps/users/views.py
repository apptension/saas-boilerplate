from config import settings
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt import views as jwt_views, tokens as jwt_tokens
from rest_framework_simplejwt.views import TokenViewBase
from social_core.actions import do_complete
from social_django.utils import psa

from . import serializers, utils


class CookieTokenRefreshView(jwt_views.TokenRefreshView):
    """Use the refresh token from an HTTP-only cookie and generate new pair (access, refresh)

    post:
    This endpoint is implemented with normal non-GraphQL request because it needs access to a refresh token cookie,
    which is an HTTP-only cookie with a path property set; this means the cookie is never sent to the GraphQL
    endpoint, thus preventing us from adding it to a blacklist.
    """

    serializer_class = serializers.CookieTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid(raise_exception=False):
            response = Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
            utils.reset_auth_cookie(response)
            return response

        response = Response(serializer.data, status=status.HTTP_200_OK)

        utils.set_auth_cookie(
            response,
            {
                settings.ACCESS_TOKEN_COOKIE: serializer.data.get("access"),
                settings.REFRESH_TOKEN_COOKIE: serializer.data.get("refresh"),
            },
        )
        return response


class LogoutView(TokenViewBase):
    """Clear cookies containing auth cookies and add refresh token to a blacklist.

    post:
    Logout is implemented with normal non-GraphQL request because it needs access to a refresh token cookie,
    which is an HTTP-only cookie with a path property set; this means the cookie is never sent to the GraphQL
    endpoint, thus preventing us from adding it to a blacklist.
    """

    permission_classes = ()
    serializer_class = serializers.LogoutSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=False):
            serializer.save()
            response = Response(serializer.data, status=status.HTTP_200_OK)
        else:
            response = Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

        utils.reset_auth_cookie(response)
        return response


@never_cache
@csrf_exempt
@psa("social:complete")
def complete(request, backend, *args, **kwargs):
    """Authentication complete view"""

    def _do_login(backend, user, social_user):
        user.backend = "{0}.{1}".format(backend.__module__, backend.__class__.__name__)

        if user.otp_verified and user.otp_enabled:
            otp_auth_token = utils.generate_otp_auth_token(user)
            backend.strategy.set_otp_auth_token(otp_auth_token)
        else:
            token = jwt_tokens.RefreshToken.for_user(user)
            backend.strategy.set_jwt(token)

    return do_complete(
        request.backend,
        _do_login,
        user=request.user,
        redirect_name=REDIRECT_FIELD_NAME,
        request=request,
        *args,  # noqa: B026
        **kwargs,
    )
