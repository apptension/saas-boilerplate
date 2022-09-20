import pytest
from django.conf import settings
from django.contrib import auth as dj_auth
from django.http import SimpleCookie
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.settings import api_settings as jwt_api_settings
from rest_framework_simplejwt.tokens import RefreshToken, BlacklistedToken, AccessToken

from .. import tokens, models

pytestmark = pytest.mark.django_db


def validate_jwt(response_data, user):
    AuthToken = jwt_api_settings.AUTH_TOKEN_CLASSES[0]
    token = AuthToken(response_data['access'])

    return token[jwt_api_settings.USER_ID_CLAIM] == user.id


class TestResetPassword:
    def test_no_email(self, api_client):
        response = api_client.post(
            reverse("password_reset"),
            {},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data
        assert response.data["is_error"]

    def test_user_not_found(self, api_client):
        response = api_client.post(
            reverse("password_reset"),
            {"email": "wrong_email@wp.pl"},
        )

        assert response.status_code == status.HTTP_201_CREATED, response.data

    def test_user_found(self, api_client, user):
        response = api_client.post(
            reverse("password_reset"),
            {"email": user.email},
        )

        assert response.status_code == status.HTTP_201_CREATED, response.data

    # Password reset confirmation
    def test_token_correct(self, api_client, user):
        password_token = tokens.password_reset_token.make_token(user)
        new_password = "random1234"

        response = api_client.post(
            reverse("password_reset_confirmation"),
            {"user": str(user.pk), "token": password_token, "new_password": new_password},
        )

        assert response.status_code == status.HTTP_201_CREATED, response.data
        u = dj_auth.get_user_model().objects.get(pk=user.pk)
        assert u.check_password(new_password)

    def test_wrong_token(self, api_client, user):
        new_password = "random1234"

        response = api_client.post(
            reverse("password_reset_confirmation"),
            {"user": str(user.pk), "token": "wrong_token", "new_password": new_password},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data
        assert response.data["is_error"], response.data
        assert response.data["non_field_errors"][0]['code'] == "invalid_token", response.data

    def test_wrong_password(self, api_client, user):
        new_password = "r"
        password_token = tokens.password_reset_token.make_token(user)

        response = api_client.post(
            reverse("password_reset_confirmation"),
            {"user": str(user.pk), "token": password_token, "new_password": new_password},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data
        assert response.data["is_error"]
        assert response.data["new_password"][0]['code'] == 'password_too_short', response.data

    def test_wrong_user(self, api_client, user):
        new_password = "random1234"
        password_token = tokens.password_reset_token.make_token(user)

        response = api_client.post(
            reverse("password_reset_confirmation"),
            {"user": "abc", "token": password_token, "new_password": new_password},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data
        assert response.data["is_error"]
        assert response.data["non_field_errors"][0]['code'] == "invalid_token", response.data

    def test_blacklist_all_jwt(self, api_client, user, faker):
        jwts = [RefreshToken.for_user(user) for _ in range(3)]
        password_token = tokens.password_reset_token.make_token(user)

        response = api_client.post(
            reverse("password_reset_confirmation"),
            {"user": str(user.pk), "token": password_token, "new_password": faker.password()},
        )

        assert response.status_code == status.HTTP_201_CREATED, response.data
        for jwt in jwts:
            assert BlacklistedToken.objects.filter(token__jti=jwt['jti']).exists()


class TestChangePassword:
    def test_correct_password(self, api_client, user_factory, faker):
        old_password = faker.password()
        user = user_factory(password=old_password)
        api_client.force_authenticate(user)

        response = api_client.post(
            reverse("change_password"),
            {"user": user.pk, "old_password": old_password, "new_password": faker.password()},
        )

        u = dj_auth.get_user_model().objects.get(pk=user.pk)

        assert response.status_code == status.HTTP_201_CREATED, response.data
        assert validate_jwt(response.data, u)

    def test_wrong_old_password(self, api_client, user, faker):
        api_client.force_authenticate(user)

        response = api_client.post(
            reverse("change_password"),
            {"user": user.pk, "old_password": "wrong_old_password", "new_password": faker.password()},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["is_error"]
        assert response.data["old_password"][0]['code'] == 'wrong_password'

    def test_user_not_auth(self, api_client, user):
        response = api_client.post(
            reverse("change_password"),
            {"user": user.pk, "old_password": "wrong_old_password", "new_password": "password1234"},
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestTokenRefresh:
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

    def test_refresh(self, api_client, user: models.User):
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

    def test_blacklist_old_token(self, api_client, user: models.User):
        refresh = RefreshToken.for_user(user)
        api_client.cookies = SimpleCookie(
            {
                settings.ACCESS_TOKEN_COOKIE: str(refresh.access_token),
                settings.REFRESH_TOKEN_COOKIE: str(refresh),
            }
        )

        api_client.post(reverse('jwt_token_refresh'))

        assert BlacklistedToken.objects.filter(token__jti=refresh['jti']).exists()


class TestLogout:
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

    def test_blacklist_old_token(self, api_client, user: models.User):
        refresh = RefreshToken.for_user(user)
        api_client.cookies = SimpleCookie(
            {
                settings.REFRESH_TOKEN_LOGOUT_COOKIE: str(refresh),
            }
        )

        api_client.post(reverse('logout'))

        assert BlacklistedToken.objects.filter(token__jti=refresh['jti']).exists()
