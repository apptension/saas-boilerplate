from enum import Enum


class OTPErrors(str, Enum):
    VERIFICATION_TOKEN_INVALID = "Verification token is invalid"
    OTP_NOT_VERIFIED = "OTP must be verified first"
