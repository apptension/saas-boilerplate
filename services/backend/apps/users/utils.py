from django.conf import settings
from django.urls import reverse


def set_auth_cookie(response, data):
    cookie_max_age = 3600 * 24 * 14  # 14 days
    access = data.get("access")
    refresh = data.get("refresh")
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
