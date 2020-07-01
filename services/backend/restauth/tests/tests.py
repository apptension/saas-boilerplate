import pytest
from django.contrib import auth as dj_auth
from django.urls import reverse
from rest_framework import status

from . import factories
from .. import tokens

pytestmark = pytest.mark.django_db


class TestUserProfile:
    def test_user_profile_only_when_authenticated(self, api_client):
        response = api_client.get(reverse("profile"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_current_user_can_fetch_profile(self, api_client, user_profile):
        api_client.force_authenticate(user_profile.user)
        response = api_client.get(reverse("profile"))
        assert response.status_code == status.HTTP_200_OK, response.data
        assert response.data["first_name"] == user_profile.first_name


class TestResetPassword:
    def test_no_email(self, api_client):
        response = api_client.post(reverse("password_reset"), {},)
        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data

    def test_user_not_found(self, api_client):
        response = api_client.post(reverse("password_reset"), {"email": "wrong_email@wp.pl"},)
        assert response.status_code == status.HTTP_404_NOT_FOUND, response.data

    def test_user_found(self, api_client, user):
        response = api_client.post(reverse("password_reset"), {"email": user.email},)
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
        assert "jwt_token" in response.data

        u = dj_auth.get_user_model().objects.get(pk=user.pk)
        assert response.data["jwt_token"] == u.jwt_token, response.data
        assert u.check_password(new_password)

    def test_wrong_token(self, api_client, user):
        new_password = "random1234"
        response = api_client.post(
            reverse("password_reset_confirmation"),
            {"user": str(user.pk), "token": "wrong_token", "new_password": new_password},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data
        assert response.data["non_field_errors"][0] == "Malformed password reset token", response.data

    def test_wrong_password(self, api_client, user):
        new_password = "r"
        password_token = tokens.password_reset_token.make_token(user)
        response = api_client.post(
            reverse("password_reset_confirmation"),
            {"user": str(user.pk), "token": password_token, "new_password": new_password},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data
        assert "too short" in response.data["new_password"][0], response.data

    def test_wrong_user(self, api_client, user):
        new_password = "random1234"
        password_token = tokens.password_reset_token.make_token(user)
        response = api_client.post(
            reverse("password_reset_confirmation"),
            {"user": "abc", "token": password_token, "new_password": new_password},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data
        assert response.data["user"][0] == "Invalid int or Hashid string", response.data


class TestChangePassword:
    def test_correct_password(self, api_client, user, faker):
        api_client.force_authenticate(user)
        response = api_client.post(
            reverse("change_password"),
            {"user": user.pk, "old_password": factories.UserFactory.password, "new_password": faker.password()},
        )

        u = dj_auth.get_user_model().objects.get(pk=user.pk)

        assert response.status_code == status.HTTP_201_CREATED, response.data
        assert response.data["jwt_token"] == u.jwt_token, response.data

    def test_wrong_old_password(self, api_client, user, faker):
        api_client.force_authenticate(user)
        response = api_client.post(
            reverse("change_password"),
            {"user": user.pk, "old_password": "wrong_old_password", "new_password": faker.password()},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Wrong old password" in response.data["old_password"]

    def test_user_not_auth(self, api_client, user):
        response = api_client.post(
            reverse("change_password"),
            {"user": user.pk, "old_password": "wrong_old_password", "new_password": "password1234"},
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
