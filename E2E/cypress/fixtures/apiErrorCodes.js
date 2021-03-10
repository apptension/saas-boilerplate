const PASSWORD_TOO_COMMON_MSG = 'This password is too common.';
const PASSWORD_TOO_COMMON_CODE = 'password_too_common';
const FIELD_MUST_BE_UNIQUE_MSG = 'This field must be unique.';
const FIELD_MUST_BE_UNIQUE_CODE = 'unique';
const NO_ACTIVE_ACCOUNT_MSG = 'No active account found with the given credentials';
const NO_ACTIVE_ACCOUNT_CODE = 'no_active_account';
const PASSWORD_NUMERIC_MSG = 'This password is entirely numeric.';
const PASSWORD_NUMERIC_CODE = 'password_entirely_numeric';
const INVALID_PASSWORD_RESET_TOKEN_MSG = 'Malformed password reset token';
const INVALID_TOKEN_CODE = 'invalid_token';
const WRONG_OLD_PASSWORD_MSG = 'Wrong old password';
const WRONG_OLD_PASSWORD_CODE = 'wrong_password';

export default {
  noActiveAccountFoundApiError: {
    non_field_errors: [{ message: NO_ACTIVE_ACCOUNT_MSG, code: NO_ACTIVE_ACCOUNT_CODE }],
    is_error: true,
  },
  commonPasswordApiError: {
    password: [{ message: PASSWORD_TOO_COMMON_MSG, code: PASSWORD_TOO_COMMON_CODE }],
    is_error: true,
  },
  commonNewPasswordApiError: {
    new_password: [{ message: PASSWORD_TOO_COMMON_MSG, code: PASSWORD_TOO_COMMON_CODE }],
    is_error: true,
  },
  numericNewPasswordApiError: {
    new_password: [{ message: PASSWORD_NUMERIC_MSG, code: PASSWORD_NUMERIC_CODE }],
    is_error: true,
  },
  notUniqueEmailApiError: {
    email: [{ message: FIELD_MUST_BE_UNIQUE_MSG, code: FIELD_MUST_BE_UNIQUE_CODE }],
    is_error: true,
  },
  malformedPasswordResetTokenApiError: {
    non_field_errors: [{ message: INVALID_PASSWORD_RESET_TOKEN_MSG, code: INVALID_TOKEN_CODE }],
    is_error: true,
  },
  wrongOldPasswordApiError: {
    old_password: [{ message: WRONG_OLD_PASSWORD_MSG, code: WRONG_OLD_PASSWORD_CODE }],
    is_error: true,
  },
  existingEmailCommonPasswordApiError: {
    email: [{ message: FIELD_MUST_BE_UNIQUE_MSG, code: FIELD_MUST_BE_UNIQUE_CODE }],
    password: [{ message: PASSWORD_TOO_COMMON_MSG, code: PASSWORD_TOO_COMMON_CODE }],
    is_error: true,
  },
};
