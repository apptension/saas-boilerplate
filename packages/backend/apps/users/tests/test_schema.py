import json
import os
import re

import pytest
from common.acl.helpers import CommonGroups
from config import settings
from graphene_file_upload.django.testing import file_graphql_query
from rest_framework_simplejwt.settings import api_settings as jwt_api_settings
from rest_framework_simplejwt.tokens import RefreshToken, BlacklistedToken, AccessToken
from .. import models, tokens
from ..utils import generate_otp_auth_token
from apps.multitenancy.constants import TenantType

pytestmark = pytest.mark.django_db

API_GRAPHQL_PATH = "/api/graphql/"


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

    @staticmethod
    def _run_correct_sing_up_mutation(graphene_client, faker):
        return graphene_client.mutate(
            TestSignup.MUTATION, variable_values={'input': {'email': faker.email(), 'password': faker.password()}}
        )

    def test_return_error_with_missing_email(self, graphene_client, faker):
        password = faker.password()
        executed = graphene_client.mutate(self.MUTATION, variable_values={'input': {'password': password}})
        err1 = f"Variable '$input' got invalid value {{'password': '{password}'}}; "
        err2 = "Field 'email' of required type 'String!' was not provided."

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
        executed = graphene_client.mutate(self.MUTATION, variable_values={'input': {'email': 'test@example.com'}})
        err1 = "Variable '$input' got invalid value {'email': 'test@example.com'}; "
        err2 = "Field 'password' of required type 'String!' was not provided."

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == err1 + err2

    def test_create_user(self, graphene_client, faker):
        email = faker.email()
        password = faker.password()
        graphene_client.mutate(self.MUTATION, variable_values={'input': {'email': email, 'password': password}})

        assert models.User.objects.get(email=email)

    def test_create_user_profile_instance(self, graphene_client, faker):
        executed = TestSignup._run_correct_sing_up_mutation(graphene_client, faker)
        user = models.User.objects.get(id=executed['data']['signUp']["id"])

        assert user.profile

    def test_add_to_user_group(self, graphene_client, faker):
        executed = TestSignup._run_correct_sing_up_mutation(graphene_client, faker)
        user = models.User.objects.get(id=executed['data']['signUp']["id"])

        assert user.has_group(CommonGroups.User)

    def test_add_user_signup_tenant(self, graphene_client, faker):
        executed = TestSignup._run_correct_sing_up_mutation(graphene_client, faker)
        user = models.User.objects.get(id=executed['data']['signUp']["id"])

        assert user.tenants.count()


class TestObtainToken:
    MUTATION = '''
        mutation($input: ObtainTokenMutationInput!){
          tokenAuth(input: $input) {
            access,
            refresh,
            otpAuthToken
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
        assert executed["data"]["tokenAuth"]["otpAuthToken"] is None

    def test_get_otp_auth_token_if_otp_enabled(self, api_client, user_factory, faker):
        user = user_factory.create(otp_enabled=True, otp_verified=True)
        password = faker.password()
        user.set_password(password)
        user.save()

        response = api_client.post(
            path=API_GRAPHQL_PATH,
            data={"query": self.MUTATION, "variables": {"input": {'email': user.email, 'password': password}}},
            format="json",
        )
        otp_auth_token = response.json()["data"]["tokenAuth"]["otpAuthToken"]

        assert otp_auth_token
        assert response.cookies[settings.OTP_AUTH_TOKEN_COOKIE].value == otp_auth_token
        assert AccessToken(otp_auth_token)["user_id"] == str(user.id)
        assert response.json()["data"]["tokenAuth"]["access"] is None
        assert response.json()["data"]["tokenAuth"]["refresh"] is None


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
                otpEnabled
                otpVerified
                tenants {
                  id
                  name
                  slug
                  type
                  membership{
                    role
                    invitationToken
                  }
                }
              }
            }
        '''
        user = user_factory(
            has_avatar=True,
            email="test@example.com",
            profile__first_name="Grzegorz",
            profile__last_name="Brzęczyszczykiewicz",
            groups=[CommonGroups.User, CommonGroups.Admin],
        )
        graphene_client.force_authenticate(user)

        executed = graphene_client.query(query)
        data = executed["data"]["currentUser"]

        assert data["id"] == user.id
        assert data["email"] == "test@example.com"
        assert data["firstName"] == "Grzegorz"
        assert data["lastName"] == "Brzęczyszczykiewicz"
        assert set(data["roles"]) == {"user", "admin"}
        assert re.match(
            "https://cdn.example.com/public/avatars/thumbnails/[a-z0-9]{16}/avatar.jpg", data["avatar"]
        ), data["avatar"]
        assert data["otpEnabled"] == user.otp_enabled
        assert data["otpVerified"] == user.otp_verified
        assert len(data["tenants"]) > 0
        assert data["tenants"][0]["name"] == "test@example.com"
        assert data["tenants"][0]["membership"]["role"] == "OWNER"
        assert data["tenants"][0]["type"] == "default"
        assert data["tenants"][0]["membership"]["invitationToken"] is None

    def test_response_data_invitation_token_active_invitation(
        self, graphene_client, user_factory, tenant_factory, tenant_membership_factory
    ):
        query = '''
            query {
              currentUser {
                tenants {
                  type
                  membership{
                    id
                    role
                    invitationAccepted
                    invitationToken
                  }
                }
              }
            }
        '''
        user = user_factory(
            has_avatar=True,
            email="test@example.com",
            profile__first_name="Grzegorz",
            profile__last_name="Brzęczyszczykiewicz",
            groups=[CommonGroups.User, CommonGroups.Admin],
        )
        tenant = tenant_factory(type=TenantType.ORGANIZATION)
        tenant_membership_factory(is_accepted=False, user=user, tenant=tenant)
        graphene_client.force_authenticate(user)

        executed = graphene_client.query(query)
        data = executed["data"]["currentUser"]
        for tenant in data["tenants"]:
            if tenant["type"] == "default":
                assert tenant["membership"]["invitationToken"] is None
            else:
                assert tenant["membership"]["invitationToken"] is not None

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

        assert executed["data"] == {'currentUser': None}


class TestUpdateCurrentUserMutation:
    def test_update_name(self, graphene_client, user_factory):
        user = user_factory(profile__first_name="FIRSTNAME", profile__last_name="LASTNAME")
        query = '''
            mutation($input: UpdateCurrentUserMutationInput!)  {
              updateCurrentUser(input: $input) {
                userProfile {
                  user {
                    firstName
                    lastName
                    avatar
                  }
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
        assert executed["data"]["updateCurrentUser"]["userProfile"]["user"] == {
            'firstName': 'Tony',
            'lastName': 'Stark',
            'avatar': None,
        }

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
            graphql_url=API_GRAPHQL_PATH,
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
                  user {
                    firstName
                    lastName
                  }
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
            variable_values={'input': {"user": user.pk.hashid, "token": token}},
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
            variable_values={'input': {"user": user.pk.hashid, "token": token}},
        )

        user.refresh_from_db()

        assert "errors" not in executed
        assert executed["data"]["confirm"]["ok"] is True
        assert user.is_active is True

    def test_wrong_token(self, graphene_client, user_factory, faker):
        user = user_factory(is_confirmed=False)

        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': {"user": user.pk.hashid, "token": "wrong-token-here"}},
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
            variable_values={'input': {"user": other_user.pk.hashid, "token": token}},
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


class TestGenerateOTPMutation:
    GENERATE_OTP_MUTATION = '''
        mutation($input: GenerateOTPMutationInput!)  {
          generateOtp(input: $input) {
            otpauthUrl,
            base32
          }
        }
    '''

    def test_return_error_for_unauthorized_user(self, graphene_client):
        executed = graphene_client.mutate(self.GENERATE_OTP_MUTATION, variable_values={'input': {}})

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_success(self, graphene_client, user):
        expected_otpauth_url = f'otpauth://totp/{settings.OTP_AUTH_ISSUER_NAME}:{user.email}?secret='.replace(
            '@', '%40'
        )

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(self.GENERATE_OTP_MUTATION, variable_values={'input': {}})
        otp_base_32 = executed['data']['generateOtp']['base32']
        otp_auth_url = executed['data']['generateOtp']['otpauthUrl']

        assert otp_base_32
        assert expected_otpauth_url in otp_auth_url
        assert models.User.objects.filter(id=user.id, otp_base32=otp_base_32, otp_auth_url=otp_auth_url).exists()


class TestVerifyOTPMutation:
    VERIFY_OTP_MUTATION = '''
        mutation($input: VerifyOTPMutationInput!)  {
          verifyOtp(input: $input) {
            otpVerified,
          }
        }
    '''

    def test_return_error_for_unauthorized_user(self, graphene_client):
        executed = graphene_client.mutate(self.VERIFY_OTP_MUTATION, variable_values={'input': {'otpToken': 'token'}})

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_success(self, graphene_client, user, totp_mock):
        totp_mock(verify=True)

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(self.VERIFY_OTP_MUTATION, variable_values={'input': {'otpToken': 'token'}})

        assert executed['data']['verifyOtp']['otpVerified'] is True
        assert models.User.objects.filter(id=user.id, otp_enabled=True, otp_verified=True).exists()

    def test_verification_fail(self, graphene_client, user, totp_mock):
        totp_mock(verify=False)

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(self.VERIFY_OTP_MUTATION, variable_values={'input': {'otpToken': 'token'}})

        assert executed["errors"][0]["message"] == "Verification token is invalid"
        assert models.User.objects.filter(id=user.id, otp_enabled=False, otp_verified=False).exists()


class TestValidateOTPMutation:
    VALIDATE_OTP_MUTATION = '''
        mutation($input: ValidateOTPMutationInput!)  {
          validateOtp(input: $input) {
            access,
            refresh
          }
        }
    '''

    def test_return_error_and_delete_cookie_if_otp_auth_token_is_invalid(self, api_client):
        api_client.cookies.load({settings.OTP_AUTH_TOKEN_COOKIE: "invalid_token"})

        response = api_client.post(
            path=API_GRAPHQL_PATH,
            data={"query": self.VALIDATE_OTP_MUTATION, "variables": {'input': {'otpToken': 'token'}}},
            format="json",
        )

        assert str(response.json()["errors"][0]["extensions"]) == str(
            {
                'non_field_errors': [
                    {'message': "No valid token found in cookie 'otp_auth_token'", 'code': 'invalid_token'}
                ]
            }
        )
        assert response.cookies[settings.OTP_AUTH_TOKEN_COOKIE].value == ""

    def test_return_error_for_otp_validation_failure(self, api_client, user_factory, totp_mock):
        user = user_factory.create(otp_verified=False)
        totp_mock(verify=False)
        api_client.cookies.load({settings.OTP_AUTH_TOKEN_COOKIE: str(generate_otp_auth_token(user))})

        response = api_client.post(
            path=API_GRAPHQL_PATH,
            data={"query": self.VALIDATE_OTP_MUTATION, "variables": {'input': {'otpToken': 'token'}}},
            format="json",
        )

        assert response.json()["errors"][0]["message"] == "OTP must be verified first"

    def test_success_sets_auth_cookies(self, api_client, user_factory, totp_mock):
        user = user_factory.create(otp_verified=True, otp_enabled=True)
        totp_mock(verify=True)
        api_client.cookies.load({settings.OTP_AUTH_TOKEN_COOKIE: str(generate_otp_auth_token(user))})

        response = api_client.post(
            path=API_GRAPHQL_PATH,
            data={"query": self.VALIDATE_OTP_MUTATION, "variables": {'input': {'otpToken': 'token'}}},
            format="json",
        )
        response_data = response.json()["data"]

        assert validate_jwt(response_data["validateOtp"], user)
        assert response.cookies[settings.OTP_AUTH_TOKEN_COOKIE].value == ""
        assert response.cookies[settings.ACCESS_TOKEN_COOKIE].value == response_data["validateOtp"]["access"]
        assert response.cookies[settings.REFRESH_TOKEN_COOKIE].value == response_data["validateOtp"]["refresh"]

    def test_success_with_otp_auth_token_in_payload(self, api_client, user_factory, totp_mock):
        user = user_factory.create(otp_verified=True, otp_enabled=True)
        totp_mock(verify=True)

        response = api_client.post(
            path=API_GRAPHQL_PATH,
            data={
                "query": self.VALIDATE_OTP_MUTATION,
                "variables": {'input': {'otpToken': 'token', 'otpAuthToken': str(generate_otp_auth_token(user))}},
            },
            format="json",
        )
        response_data = response.json()["data"]

        assert validate_jwt(response_data["validateOtp"], user)


class TestDisableOTPMutation:
    DISABLE_OTP_MUTATION = '''
        mutation($input: DisableOTPMutationInput!)  {
          disableOtp(input: $input) {
            ok,
          }
        }
    '''

    def test_return_error_for_unauthorized_user(self, graphene_client):
        executed = graphene_client.mutate(self.DISABLE_OTP_MUTATION, variable_values={'input': {}})

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_success(self, graphene_client, user, totp_mock):
        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(self.DISABLE_OTP_MUTATION, variable_values={'input': {}})

        assert executed['data']['disableOtp']['ok'] is True
        assert models.User.objects.filter(
            id=user.id, otp_enabled=False, otp_verified=False, otp_base32="", otp_auth_url=""
        ).exists()
