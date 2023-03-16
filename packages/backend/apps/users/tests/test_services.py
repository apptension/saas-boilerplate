import pytest
from apps.users.exceptions import OTPVerificationFailure
from apps.users.models import User
from ..services.otp import validate_otp

pytestmark = pytest.mark.django_db


class TestValidateOtp:
    def test_otp_is_not_verified_raises_exception(self, user: User):
        with pytest.raises(OTPVerificationFailure) as error:
            validate_otp(user, "token")

        assert str(error.value) == "OTP must be verified first"

    def test_invalid_token_raises_exception(self, user_factory, totp_mock):
        user = user_factory.create(otp_verified=True)
        totp_mock(verify=False)

        with pytest.raises(OTPVerificationFailure) as error:
            validate_otp(user, "token")

        assert str(error.value) == "Verification token is invalid"
