from django.utils import timezone
from rest_framework_simplejwt.tokens import AccessToken

from django.conf import settings
from django.urls import reverse


def set_auth_cookie(response, data):
    cookie_max_age = settings.COOKIE_MAX_AGE
    cookie_secure = getattr(settings, 'COOKIE_SECURE', True)
    cookie_samesite = getattr(settings, 'COOKIE_SAMESITE', 'Lax')

    access = data.get(settings.ACCESS_TOKEN_COOKIE)
    refresh = data.get(settings.REFRESH_TOKEN_COOKIE)
    response.set_cookie(
        settings.ACCESS_TOKEN_COOKIE,
        access,
        max_age=cookie_max_age,
        httponly=True,
        secure=cookie_secure,
        samesite=cookie_samesite,
        path="/",  # Explicitly set root path to match delete_cookie
    )

    if refresh:
        response.set_cookie(
            settings.REFRESH_TOKEN_COOKIE,
            refresh,
            max_age=cookie_max_age,
            httponly=True,
            secure=cookie_secure,
            samesite=cookie_samesite,
            path=reverse("jwt_token_refresh"),
        )

        # Set logout cookie with broader path (/api/) to ensure it's sent
        # regardless of proxy configurations (Vite dev, nginx, etc.)
        response.set_cookie(
            settings.REFRESH_TOKEN_LOGOUT_COOKIE,
            refresh,
            max_age=cookie_max_age,
            httponly=True,
            secure=cookie_secure,
            samesite=cookie_samesite,
            path="/api/",
        )


def reset_auth_cookie(response):
    """Clear all auth cookies. Must use the same samesite attribute as when setting cookies."""
    cookie_samesite = getattr(settings, 'COOKIE_SAMESITE', 'Lax')

    # Delete access token cookie (set at root path)
    response.delete_cookie(settings.ACCESS_TOKEN_COOKIE, path="/", samesite=cookie_samesite)

    # Delete refresh token cookies - try multiple paths to ensure cleanup
    # regardless of how cookies were originally set
    response.delete_cookie(settings.REFRESH_TOKEN_COOKIE, samesite=cookie_samesite)
    response.delete_cookie(settings.REFRESH_TOKEN_COOKIE, path=reverse("jwt_token_refresh"), samesite=cookie_samesite)

    # Delete logout cookie with broader path (matching how it's set)
    response.delete_cookie(settings.REFRESH_TOKEN_LOGOUT_COOKIE, path="/api/", samesite=cookie_samesite)
    # Also try to delete with old path for backwards compatibility
    response.delete_cookie(settings.REFRESH_TOKEN_LOGOUT_COOKIE, path=reverse("logout"), samesite=cookie_samesite)


def generate_otp_auth_token(user):
    otp_auth_token = AccessToken()
    otp_auth_token["user_id"] = str(user.id)
    otp_auth_token.set_exp(from_time=timezone.now(), lifetime=settings.OTP_AUTH_TOKEN_LIFETIME_MINUTES)

    return otp_auth_token
