import json
import os
import re

import pytest
from graphene_file_upload.django.testing import file_graphql_query
from rest_framework_simplejwt.settings import api_settings as jwt_api_settings
from rest_framework_simplejwt.tokens import RefreshToken, BlacklistedToken

from common.acl.helpers import CommonGroups
from .. import models, tokens

pytestmark = pytest.mark.django_db


def validate_jwt(response_data, user):
    AuthToken = jwt_api_settings.AUTH_TOKEN_CLASSES[0]
    token = AuthToken(response_data['access'])

    return token[jwt_api_settings.USER_ID_CLAIM] == user.id


class TestSignup:
    MUTATION = '''
        mutation SignUp($input: SingUpMutationInput!) {
          signUp(input: $input) {
            id
            email
            access
            refresh
          }
        }
    '''

    def test_return_error_with_missing_email(self, graphene_client, faker):
        password = faker.password()
        executed = graphene_client.mutate(self.MUTATION, variable_values={'input': {'password': password}})
        err1 = f'Variable "$input" got invalid value {{"password": "{password}"}}.'
        err2 = '\nIn field "email": Expected "String!", found null.'

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == err1 + err2

    def test_return_error_with_invalid_email(self, graphene_client, faker):
        password = faker.password()
        executed = graphene_client.mutate(
            self.MUTATION, variable_values={'input': {'email': 'wrong-email', 'password': password}}
        )

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == "GraphQlValidationError"

    def test_return_error_with_missing_password(self, graphene_client, faker):
        executed = graphene_client.mutate(self.MUTATION, variable_values={'input': {'email': 'test@email.com'}})
        err1 = 'Variable "$input" got invalid value {"email": "test@email.com"}.'
        err2 = '\nIn field "password": Expected "String!", found null.'

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == err1 + err2

    def test_create_user(self, graphene_client, faker):
        email = faker.email()
        password = faker.password()
        graphene_client.mutate(self.MUTATION, variable_values={'input': {'email': email, 'password': password}})

        assert models.User.objects.get(email=email)

    def test_create_user_profile_instance(self, graphene_client, faker):
        executed = graphene_client.mutate(
            self.MUTATION, variable_values={'input': {'email': faker.email(), 'password': faker.password()}}
        )

        user = models.User.objects.get(id=executed['data']['signUp']["id"])
        assert user.profile

    def test_add_to_user_group(self, graphene_client, faker):
        executed = graphene_client.mutate(
            self.MUTATION, variable_values={'input': {'email': faker.email(), 'password': faker.password()}}
        )

        user = models.User.objects.get(id=executed['data']['signUp']["id"])
        assert user.has_group(CommonGroups.User)


class TestObtainToken:
    MUTATION = '''
        mutation($input: ObtainTokenMutationInput!){
          tokenAuth(input: $input) {
            access
            refresh
          }
        }
    '''

    def test_return_invalid_credentials_error(self, graphene_client, user):
        executed = graphene_client.mutate(
            self.MUTATION, variable_values={'input': {'email': user.email, 'password': "wrong-password"}}
        )

        assert len(executed["errors"]) == 1

    def test_get_jwt(self, graphene_client, user, faker):
        password = faker.password()
        user.set_password(password)
        user.save()

        executed = graphene_client.mutate(
            self.MUTATION, variable_values={'input': {'email': user.email, 'password': password}}
        )

        assert validate_jwt(executed["data"]["tokenAuth"], user)


class TestCurrentUserQuery:
    def test_response_data(self, graphene_client, user_factory, user_avatar_factory):
        query = '''
            query {
              currentUser {
                id
                email
                firstName
                lastName
                roles
                avatar
              }
            }
        '''
        user = user_factory(
            has_avatar=True,
            email="test@apptension.com",
            profile__first_name="Grzegorz",
            profile__last_name="Brzęczyszczykiewicz",
            groups=[CommonGroups.User, CommonGroups.Admin],
        )
        graphene_client.force_authenticate(user)

        executed = graphene_client.query(query)
        data = executed["data"]["currentUser"]

        assert data["id"] == user.id
        assert data["email"] == "test@apptension.com"
        assert data["firstName"] == "Grzegorz"
        assert data["lastName"] == "Brzęczyszczykiewicz"
        assert set(data["roles"]) == {"user", "admin"}
        assert re.match("https://cdn.example.com/avatars/thumbnails/[a-z0-9]{16}/avatar.jpg", data["avatar"]), data[
            "avatar"
        ]

    def test_not_authenticated(self, graphene_client):
        executed = graphene_client.query(
            '''
            query {
              currentUser {
                email
              }
            }
        '''
        )

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == "permission_denied"
        assert executed["data"] == {'currentUser': None}


class TestUpdateCurrentUserMutation:
    def test_update_name(self, graphene_client, user_factory):
        user = user_factory(profile__first_name="FIRSTNAME", profile__last_name="LASTNAME")
        query = '''
            mutation($input: UpdateCurrentUserMutationInput!)  {
              updateCurrentUser(input: $input) {
                userProfile {
                  firstName
                  lastName
                }
              }
            }
        '''

        graphene_client.force_authenticate(user)

        executed = graphene_client.mutate(
            query,
            variable_values={'input': {"firstName": "Tony", "lastName": "Stark"}},
        )
        assert "errors" not in executed
        assert executed["data"]["updateCurrentUser"]["userProfile"] == {'firstName': 'Tony', 'lastName': 'Stark'}

    def test_update_avatar(self, api_client, user_factory, image_factory):
        user = user_factory(profile__first_name="FIRSTNAME", profile__last_name="LASTNAME")
        avatar_file = image_factory(name="avatar_new.png", params={"width": 1})
        query = '''
            mutation($input: UpdateCurrentUserMutationInput!)  {
              updateCurrentUser(input: $input) {
                userProfile {
                  user {
                    avatar
                  }
                }
              }
            }
        '''

        api_client.force_authenticate(user)

        response = file_graphql_query(
            query,
            client=api_client,
            variables={"input": {}},
            files={"avatar": avatar_file},
            graphql_url="/api/graphql/",
        )
        executed = json.loads(response.content)
        user.profile.refresh_from_db()
        user_file_name = os.path.split(user.profile.avatar.thumbnail.name)[1]
        assert "errors" not in executed
        response_file_name = os.path.split(executed["data"]["updateCurrentUser"]["userProfile"]["user"]["avatar"])[1]

        assert user_file_name == response_file_name == "avatar_new.png"

    def test_not_authenticated(self, graphene_client):
        query = '''
            mutation($input: UpdateCurrentUserMutationInput!)  {
              updateCurrentUser(input: $input) {
                userProfile {
                  firstName
                  lastName
                }
              }
            }
        '''

        executed = graphene_client.mutate(
            query,
            variable_values={'input': {"firstName": "Tony", "lastName": "Stark"}},
        )

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == "permission_denied"
        assert executed["data"] == {'updateCurrentUser': None}


class TestChangePasswordMutation:
    MUTATION = '''
        mutation ChangePassword($input: ChangePasswordMutationInput!) {
          changePassword(input: $input) {
            refresh
            access
          }
        }
    '''

    def test_correct_password(self, graphene_client, user_factory, faker):
        old_password = faker.password()
        new_password = faker.password()
        user = user_factory(password=old_password)
        graphene_client.force_authenticate(user)

        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': {"oldPassword": old_password, "newPassword": new_password}},
        )

        user.refresh_from_db()

        assert "errors" not in executed
        assert validate_jwt(executed["data"]["changePassword"], user)

    def test_wrong_old_password(self, graphene_client, user, faker):
        graphene_client.force_authenticate(user)

        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': {"oldPassword": "wrong_old_password", "newPassword": faker.password()}},
        )

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == "GraphQlValidationError"
        assert executed["data"] == {'changePassword': None}

    def test_not_authenticated(self, graphene_client, faker):
        old_password = faker.password()
        new_password = faker.password()
        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': {"oldPassword": old_password, "newPassword": new_password}},
        )

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == "permission_denied"
        assert executed["data"] == {'changePassword': None}


class TestConfirmEmailMutation:
    MUTATION = '''
        mutation ConfirmEmail($input: ConfirmEmailMutationInput!) {
          confirm(input: $input) {
            ok
          }
        }
    '''

    def test_correct_token_user_authenticated(self, graphene_client, user_factory, faker):
        user = user_factory(is_confirmed=False)
        token = tokens.account_activation_token.make_token(user)
        graphene_client.force_authenticate(user)

        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': {"user": user.pk, "token": token}},
        )

        user.refresh_from_db()

        assert "errors" not in executed
        assert executed["data"]["confirm"]["ok"] is True
        assert user.is_active is True

    def test_correct_token_unauthorized(self, graphene_client, user_factory, faker):
        user = user_factory(is_confirmed=False)
        token = tokens.account_activation_token.make_token(user)

        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': {"user": user.pk, "token": token}},
        )

        user.refresh_from_db()

        assert "errors" not in executed
        assert executed["data"]["confirm"]["ok"] is True
        assert user.is_active is True

    def test_wrong_token(self, graphene_client, user_factory, faker):
        user = user_factory(is_confirmed=False)

        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': {"user": user.pk, "token": "wrong-token-here"}},
        )

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == "GraphQlValidationError"
        assert executed["data"] == {'confirm': None}

    def test_wrong_user(self, graphene_client, user_factory, faker):
        user = user_factory(is_confirmed=False)
        other_user = user_factory(is_confirmed=False)
        token = tokens.account_activation_token.make_token(user)

        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': {"user": other_user.pk, "token": token}},
        )

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == "GraphQlValidationError"
        assert executed["data"] == {'confirm': None}


class TestResetPassword:
    MUTATION = '''
        mutation PasswordReset($input: PasswordResetMutationInput!) {
          passwordReset(input: $input) {
            ok
          }
        }
    '''

    def test_no_email(self, graphene_client):
        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': {}},
        )

        assert len(executed["errors"]) == 1

    def test_user_not_found(self, graphene_client):
        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': {"email": "wrong_email@example.com"}},
        )

        assert "errors" not in executed
        assert executed["data"]["passwordReset"]["ok"] is True

    def test_user_found(self, graphene_client, user):
        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': {"email": user.email}},
        )

        assert "errors" not in executed
        assert executed["data"]["passwordReset"]["ok"] is True


class TestResetPasswordConfirm:
    MUTATION = '''
        mutation PasswordResetConfirm($input: PasswordResetConfirmationMutationInput!) {
          passwordResetConfirm(input: $input) {
            ok
          }
        }
    '''

    # Password reset confirmation
    def test_token_correct(self, graphene_client, user):
        password_token = tokens.password_reset_token.make_token(user)
        new_password = "random1234"

        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': {"user": str(user.pk), "token": password_token, "newPassword": new_password}},
        )

        assert "errors" not in executed
        assert executed["data"]["passwordResetConfirm"]["ok"] is True

        user.refresh_from_db()
        assert user.check_password(new_password)

    def test_wrong_token(self, graphene_client, user):
        new_password = "random1234"

        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={"input": {"user": str(user.pk), "token": "wrong_token", "newPassword": new_password}},
        )

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == "GraphQlValidationError"
        assert executed["data"] == {'passwordResetConfirm': None}

    def test_wrong_password(self, graphene_client, user):
        new_password = "r"
        password_token = tokens.password_reset_token.make_token(user)

        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={"input": {"user": str(user.pk), "token": password_token, "newPassword": new_password}},
        )

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == "GraphQlValidationError"
        assert executed["data"] == {'passwordResetConfirm': None}

    def test_wrong_user(self, graphene_client, user):
        new_password = "random1234"
        password_token = tokens.password_reset_token.make_token(user)

        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={"input": {"user": "abc", "token": password_token, "newPassword": new_password}},
        )

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == "GraphQlValidationError"
        assert executed["data"] == {'passwordResetConfirm': None}

    def test_blacklist_all_jwt(self, graphene_client, user, faker):
        jwts = [RefreshToken.for_user(user) for _ in range(3)]
        password_token = tokens.password_reset_token.make_token(user)

        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={"input": {"user": str(user.pk), "token": password_token, "newPassword": faker.password()}},
        )

        assert "errors" not in executed
        for jwt in jwts:
            assert BlacklistedToken.objects.filter(token__jti=jwt['jti']).exists()
