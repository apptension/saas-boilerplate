export default {
  emptyEmailAndPasswordApiError: {
    email: ['This field may not be blank.'],
    password: ['This field may not be blank.'],
    is_error: true,
  },
  emptyEmailApiError: {
    email: ['This field may not be blank.'],
    is_error: true,
  },
  emptyPasswordApiError: {
    password: ['This field may not be blank.'],
    is_error: true,
  },
  noActiveAccountFoundApiError: {
    non_field_errors: ['No active account found with the given credentials'],
    is_error: true,
  },
  invalidEmailApiError: {
    email: ['Enter a valid email address.'],
    is_error: true,
  },
  invalidEmailShortPasswordApiError: {
    email: ['Enter a valid email address.'],
    password: ['This password is too short. It must contain at least 8 characters.'],
    is_error: true,
  },
  invalidEmailCommonPasswordApiError: {
    email: ['Enter a valid email address.'],
    password: ['This password is too common.'],
    is_error: true,
  },
  shortPasswordApiError: {
    password: ['This password is too short. It must contain at least 8 characters.'],
    is_error: true,
  },
  shortNewPasswordApiError: {
    new_password: ['This password is too short. It must contain at least 8 characters.'],
    is_error: true,
  },
  commonPasswordApiError: {
    password: ['This password is too common.'],
    is_error: true,
  },
  commonNewPasswordApiError: {
    new_password: ['This password is too common.'],
    is_error: true,
  },
  numericNewPasswordApiError: {
    new_password: ['This password is entirely numeric.'],
    is_error: true,
  },
  notUniqueEmailApiError: {
    email: ['This field must be unique.'],
    is_error: true,
  },
  notUniqueEmailShortPasswordApiError: {
    email: ['This field must be unique.'],
    password: ['This password is too short. It must contain at least 8 characters.'],
    is_error: true,
  },
  notUniqueEmailCommonPasswordApiError: {
    email: ['This field must be unique.'],
    password: ['This password is too common.'],
    is_error: true,
  },
  malformedPasswordResetTokenApiError: {
    non_field_errors: ['Malformed password reset token'],
    is_error: true,
  },
  wrongOldPasswordApiError: {
    old_password: ['Wrong old password'],
    is_error: true,
  },
};
