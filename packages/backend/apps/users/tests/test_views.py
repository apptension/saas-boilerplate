import pytest
from django.conf import settings
from django.http import SimpleCookie
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.settings import api_settings as jwt_api_settings
from rest_framework_simplejwt.tokens import RefreshToken, BlacklistedToken, AccessToken

from .. import models

pytestmark = pytest.mark.django_db


def validate_jwt(response_data, user):
    AuthToken = jwt_api_settings.AUTH_TOKEN_CLASSES[0]
    token = AuthToken(response_data['access'])

    return token[jwt_api_settings.USER_ID_CLAIM] == user.id


class TestTokenRefresh:
    def test_return_error_if_no_cookie_or_payload_is_sent(self, api_client):
        response = api_client.post(reverse('jwt_token_refresh'))
        assert response.json() == {
            'non_field_errors': ["No valid token found in cookie 'refresh_token' or field 'refresh'"]
        }

    def test_return_error_for_invalid_refresh_token(self, api_client, user: models.User):
        refresh = RefreshToken.for_user(user)
        api_client.cookies = SimpleCookie(
            {
                settings.ACCESS_TOKEN_COOKIE: str(refresh.access_token),
                settings.REFRESH_TOKEN_COOKIE: 'invalid-token',
            }
        )

        response = api_client.post(
            reverse('jwt_token_refresh'),
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.cookies[settings.ACCESS_TOKEN_COOKIE].value == ''
        assert response.cookies[settings.REFRESH_TOKEN_COOKIE].value == ''

    def test_refresh_cookie_auth(self, api_client, user: models.User):
        refresh = RefreshToken.for_user(user)
        api_client.cookies = SimpleCookie(
            {
                settings.ACCESS_TOKEN_COOKIE: str(refresh.access_token),
                settings.REFRESH_TOKEN_COOKIE: str(refresh),
            }
        )

        response = api_client.post(reverse('jwt_token_refresh'))

        assert response.status_code == status.HTTP_200_OK
        new_access_token_raw = response.cookies[settings.ACCESS_TOKEN_COOKIE].value
        new_refresh_token_raw = response.cookies[settings.REFRESH_TOKEN_COOKIE].value
        assert AccessToken(new_access_token_raw), new_access_token_raw
        assert RefreshToken(new_refresh_token_raw), new_refresh_token_raw
        assert BlacklistedToken.objects.filter(token__jti=refresh['jti']).exists()

    def test_refresh_sent_in_payload(self, api_client, user: models.User):
        refresh = RefreshToken.for_user(user)

        response = api_client.post(reverse('jwt_token_refresh'), data={'refresh': str(refresh)})

        assert response.status_code == status.HTTP_200_OK
        new_access_token_raw = response.json().get('access')
        new_refresh_token_raw = response.json().get('refresh')
        assert AccessToken(new_access_token_raw), new_access_token_raw
        assert RefreshToken(new_refresh_token_raw), new_refresh_token_raw
        assert BlacklistedToken.objects.filter(token__jti=refresh['jti']).exists()


class TestLogout:
    def test_raise_error_if_no_cookie_or_payload_is_sent(self, api_client):
        response = api_client.post(reverse('logout'))
        assert response.json() == {
            'non_field_errors': ["No valid token found in cookie 'refresh_token' or field 'refresh'"]
        }

    def test_clear_cookies(self, api_client, user: models.User):
        refresh = RefreshToken.for_user(user)
        api_client.cookies = SimpleCookie(
            {
                settings.REFRESH_TOKEN_LOGOUT_COOKIE: str(refresh),
            }
        )

        response = api_client.post(reverse('logout'))

        assert response.status_code == status.HTTP_200_OK
        assert not response.cookies[settings.ACCESS_TOKEN_COOKIE].value
        assert not response.cookies[settings.REFRESH_TOKEN_COOKIE].value
        assert not response.cookies[settings.REFRESH_TOKEN_LOGOUT_COOKIE].value

    def test_blacklist_old_token_with_cookie_auth(self, api_client, user: models.User):
        refresh = RefreshToken.for_user(user)
        api_client.cookies = SimpleCookie(
            {
                settings.REFRESH_TOKEN_LOGOUT_COOKIE: str(refresh),
            }
        )

        api_client.post(reverse('logout'))

        assert BlacklistedToken.objects.filter(token__jti=refresh['jti']).exists()

    def test_blacklist_old_token_with_refresh_in_payload(self, api_client, user: models.User):
        refresh = RefreshToken.for_user(user)
        api_client.post(reverse('logout'), data={'refresh': str(refresh)})
        assert BlacklistedToken.objects.filter(token__jti=refresh['jti']).exists()
