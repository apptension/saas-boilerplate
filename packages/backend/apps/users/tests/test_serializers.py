import json
from typing import Optional

from apps.users.exceptions import OTPVerificationFailure
from django.utils import timezone
from rest_framework_simplejwt.tokens import AccessToken

from config import settings
from rest_framework.exceptions import ValidationError, ErrorDetail

import pytest
from apps.users.serializers import ValidateOTPSerializer

pytestmark = pytest.mark.django_db


class TestValidateOTPSerializer:
    @pytest.fixture
    def context_with_request_cookies(self, mocker):
        def _factory(cookies: Optional[dict] = None):
            request = mocker.Mock()
            request.COOKIES = cookies if cookies else {}
            context = {"request": request}

            return context

        return _factory

    @pytest.fixture
    def otp_token_factory(self):
        def _factory(**kwargs) -> AccessToken:
            token = AccessToken()
            for k, v in kwargs.items():
                token[k] = v
            token.set_exp(from_time=timezone.now(), lifetime=settings.OTP_AUTH_TOKEN_LIFETIME_MINUTES)

            return token

        return _factory

    @staticmethod
    def assert_invalid_token(error):
        assert json.dumps(error.value.detail) == json.dumps(
            {
                'non_field_errors': [
                    ErrorDetail(string="No valid token found in cookie 'otp_auth_token'", code='invalid_token')
                ]
            }
        )

    def test_missing_otp_auth_token_cookie_raises_invalid_token_error(self, context_with_request_cookies):
        serializer = ValidateOTPSerializer(data={"otp_token": "token"}, context=context_with_request_cookies())

        with pytest.raises(ValidationError) as error:
            serializer.is_valid(raise_exception=True)

        self.assert_invalid_token(error)

    def test_invalid_otp_auth_token_cookie_raises_invalid_token_error(self, context_with_request_cookies):
        context = context_with_request_cookies({settings.OTP_AUTH_TOKEN_COOKIE: "invalid-token"})
        serializer = ValidateOTPSerializer(data={"otp_token": "token"}, context=context)

        with pytest.raises(ValidationError) as error:
            serializer.is_valid(raise_exception=True)

        self.assert_invalid_token(error)

    def test_missing_user_id_in_otp_auth_token_cookie_raises_invalid_token_error(
        self, context_with_request_cookies, otp_token_factory
    ):
        token = otp_token_factory()
        context = context_with_request_cookies({settings.OTP_AUTH_TOKEN_COOKIE: str(token)})
        serializer = ValidateOTPSerializer(data={"otp_token": "token"}, context=context)

        with pytest.raises(ValidationError) as error:
            serializer.is_valid(raise_exception=True)

        self.assert_invalid_token(error)

    def test_invalid_user_id_in_otp_auth_token_cookie_raises_invalid_token_error(
        self, context_with_request_cookies, otp_token_factory
    ):
        token = otp_token_factory(user_id="not-existing-id")
        context = context_with_request_cookies({settings.OTP_AUTH_TOKEN_COOKIE: str(token)})
        serializer = ValidateOTPSerializer(data={"otp_token": "token"}, context=context)

        with pytest.raises(ValidationError) as error:
            serializer.is_valid(raise_exception=True)

        self.assert_invalid_token(error)

    def test_otp_validation_failure_raises_exception(self, context_with_request_cookies, otp_token_factory, user):
        token = otp_token_factory(user_id=str(user.id))
        context = context_with_request_cookies({settings.OTP_AUTH_TOKEN_COOKIE: str(token)})
        serializer = ValidateOTPSerializer(data={"otp_token": "token"}, context=context)

        with pytest.raises(OTPVerificationFailure) as error:
            serializer.is_valid(raise_exception=True)

        assert str(error.value) == "OTP must be verified first"
