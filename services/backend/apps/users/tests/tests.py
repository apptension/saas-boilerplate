import pytest
from django.contrib import auth as dj_auth
from django.http import SimpleCookie
from django.urls import reverse
from rest_framework import status
from rest_framework_jwt.settings import api_settings

from .. import tokens, models

pytestmark = pytest.mark.django_db


def validate_jwt_token(token, user):
    jwt_decode_handler = api_settings.JWT_DECODE_HANDLER
    return jwt_decode_handler(token)['user_id'] == user.id


class TestSignup:
    def test_return_error_with_missing_email(self, api_client, faker):
        response = api_client.post(
            reverse('signup'),
            {
                'password': faker.password(),
            },
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data

    def test_return_error_with_invalid_email(self, api_client, faker):
        response = api_client.post(
            reverse('signup'),
            {
                'email': 'this-is-not-an-email',
                'password': faker.password(),
            },
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data

    def test_return_error_with_missing_password(self, api_client, faker):
        response = api_client.post(
            reverse('signup'),
            {
                'email': faker.email(),
            },
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data

    def test_create_user(self, api_client, faker):
        email = faker.email()
        response = api_client.post(
            reverse('signup'),
            {
                'email': email,
                'password': faker.password(),
            },
        )
        assert response.status_code == status.HTTP_201_CREATED, response.data
        assert models.User.objects.get(email=email)

    def test_create_user_profile_instance(self, api_client, faker):
        response = api_client.post(
            reverse('signup'),
            {
                'email': faker.email(),
                'password': faker.password(),
            },
        )
        assert response.status_code == status.HTTP_201_CREATED, response.data
        user = models.User.objects.get(id=response.data['id'])
        assert user.profile


class TestUserProfile:
    def test_user_profile_only_when_authenticated(self, api_client):
        response = api_client.get(reverse("profile"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_current_user_can_fetch_profile(self, api_client, user_profile):
        api_client.force_authenticate(user_profile.user)
        response = api_client.get(reverse("profile"))
        assert response.status_code == status.HTTP_200_OK, response.data
        assert response.data["id"] == user_profile.user.id
        assert response.data["email"] == user_profile.user.email
        assert response.data["first_name"] == user_profile.first_name
        assert response.data["last_name"] == user_profile.last_name

    def test_update_user_profile(self, api_client, user_profile):
        api_client.force_authenticate(user_profile.user)
        first_name = 'Changed-first-name'
        last_name = 'Changed-last-name'
        api_client.put(reverse("profile"), {'first_name': first_name, 'last_name': last_name}, format='json')

        user_profile.refresh_from_db()

        user_profile.first_name = first_name
        user_profile.last_name = last_name

    def test_update_user_profile_response(self, api_client, user_profile):
        api_client.force_authenticate(user_profile.user)
        first_name = 'Changed-first-name'
        last_name = 'Changed-last-name'
        response = api_client.put(reverse("profile"), {'first_name': first_name, 'last_name': last_name}, format='json')

        assert response.status_code == status.HTTP_200_OK, response.data
        assert response.data["id"] == user_profile.user.id
        assert response.data["email"] == user_profile.user.email
        assert response.data["first_name"] == first_name
        assert response.data["last_name"] == last_name


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
        assert response.status_code == status.HTTP_404_NOT_FOUND, response.data

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
        assert "jwt_token" in response.data

        u = dj_auth.get_user_model().objects.get(pk=user.pk)
        assert validate_jwt_token(response.data["jwt_token"], u)
        assert u.check_password(new_password)

    def test_wrong_token(self, api_client, user):
        new_password = "random1234"
        response = api_client.post(
            reverse("password_reset_confirmation"),
            {"user": str(user.pk), "token": "wrong_token", "new_password": new_password},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data
        assert response.data["non_field_errors"][0] == "Malformed password reset token", response.data
        assert response.data["is_error"]

    def test_wrong_password(self, api_client, user):
        new_password = "r"
        password_token = tokens.password_reset_token.make_token(user)
        response = api_client.post(
            reverse("password_reset_confirmation"),
            {"user": str(user.pk), "token": password_token, "new_password": new_password},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data
        assert response.data["is_error"]
        assert "too short" in response.data["new_password"][0], response.data

    def test_wrong_user(self, api_client, user):
        new_password = "random1234"
        password_token = tokens.password_reset_token.make_token(user)
        response = api_client.post(
            reverse("password_reset_confirmation"),
            {"user": "abc", "token": password_token, "new_password": new_password},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data
        assert response.data["is_error"]
        assert response.data["user"][0] == "Invalid int or Hashid string", response.data


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
        assert validate_jwt_token(response.data["jwt_token"], u)

    def test_wrong_old_password(self, api_client, user, faker):
        api_client.force_authenticate(user)
        response = api_client.post(
            reverse("change_password"),
            {"user": user.pk, "old_password": "wrong_old_password", "new_password": faker.password()},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["is_error"]
        assert "Wrong old password" in response.data["old_password"]

    def test_user_not_auth(self, api_client, user):
        response = api_client.post(
            reverse("change_password"),
            {"user": user.pk, "old_password": "wrong_old_password", "new_password": "password1234"},
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestLogout:
    def test_logout(self, api_client, user: models.User):
        api_client.force_authenticate(user)
        response = api_client.post(
            reverse('logout'), cookies=SimpleCookie({api_settings.JWT_AUTH_COOKIE: user.jwt_token})
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.cookies[api_settings.JWT_AUTH_COOKIE].value == ''
