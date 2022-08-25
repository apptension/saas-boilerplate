import pytest
from rest_framework_simplejwt.settings import api_settings as jwt_api_settings

from common.acl.helpers import CommonGroups
from .. import models

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
