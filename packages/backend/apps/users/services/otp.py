from typing import Tuple

import pyotp
from apps.users.exceptions import OTPVerificationFailure
from apps.users.constants import OTPErrors
from apps.users.models import User
from config import settings


def generate_otp(user: User) -> Tuple[str, str]:
    otp_base32 = pyotp.random_base32()
    otp_auth_url = pyotp.totp.TOTP(otp_base32).provisioning_uri(
        name=user.email.lower(), issuer_name=settings.OTP_AUTH_ISSUER_NAME
    )

    user.otp_auth_url = otp_auth_url
    user.otp_base32 = otp_base32
    user.save()

    return otp_base32, otp_auth_url


def verify_otp(user: User, otp_token: str):
    totp = pyotp.TOTP(user.otp_base32)
    if not totp.verify(otp_token):
        raise OTPVerificationFailure(OTPErrors.VERIFICATION_TOKEN_INVALID.value)

    user.otp_enabled = True
    user.otp_verified = True
    user.save()


def validate_otp(user: User, otp_token: str):
    if not user.otp_verified:
        raise OTPVerificationFailure(OTPErrors.OTP_NOT_VERIFIED.value)

    totp = pyotp.TOTP(user.otp_base32)
    if not totp.verify(otp_token, valid_window=1):
        raise OTPVerificationFailure(OTPErrors.VERIFICATION_TOKEN_INVALID.value)


def disable_otp(user: User):
    user.otp_enabled = False
    user.otp_verified = False
    user.otp_base32 = ""
    user.otp_auth_url = ""

    user.save()
