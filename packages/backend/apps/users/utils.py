from django.utils import timezone
from rest_framework_simplejwt.tokens import AccessToken

from django.conf import settings
from django.urls import reverse


def set_auth_cookie(response, data):
    cookie_max_age = settings.COOKIE_MAX_AGE
    access = data.get(settings.ACCESS_TOKEN_COOKIE)
    refresh = data.get(settings.REFRESH_TOKEN_COOKIE)
    response.set_cookie(settings.ACCESS_TOKEN_COOKIE, access, max_age=cookie_max_age, httponly=True)

    if refresh:
        response.set_cookie(
            settings.REFRESH_TOKEN_COOKIE,
            refresh,
            max_age=cookie_max_age,
            httponly=True,
            path=reverse("jwt_token_refresh"),
        )

        response.set_cookie(
            settings.REFRESH_TOKEN_LOGOUT_COOKIE,
            refresh,
            max_age=cookie_max_age,
            httponly=True,
            path=reverse("logout"),
        )


def reset_auth_cookie(response):
    response.delete_cookie(settings.ACCESS_TOKEN_COOKIE)
    response.delete_cookie(settings.REFRESH_TOKEN_COOKIE)
    response.delete_cookie(settings.REFRESH_TOKEN_COOKIE, path=reverse("jwt_token_refresh"))
    response.delete_cookie(settings.REFRESH_TOKEN_LOGOUT_COOKIE, path=reverse("logout"))


def generate_otp_auth_token(user):
    otp_auth_token = AccessToken()
    otp_auth_token["user_id"] = str(user.id)
    otp_auth_token.set_exp(from_time=timezone.now(), lifetime=settings.OTP_AUTH_TOKEN_LIFETIME_MINUTES)

    return otp_auth_token
