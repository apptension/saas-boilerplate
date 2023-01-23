import {
  COMMON_PASSWORD,
  EMPTY_INPUT,
  INVALID_EMAIL,
  NUMERIC_PASSWORD,
  TOO_SHORT_PASSWORD,
  VALID_PASSWORD,
} from './signupData';
import API_ERROR_CODES from './apiErrorCodes';
import {
  COMMON,
  COMMON_PASSWORD_ERROR_TEXT,
  EMPTY,
  EMPTY_EMAIL_ERROR_TEXT,
  EMPTY_PASSWORD_ERROR_TEXT,
  EMPTY_REPEAT_NEW_PASSWORD_ERROR_TEXT,
  INVALID,
  INVALID_EMAIL_ERROR_TEXT,
  NUMERIC,
  NUMERIC_PASSWORD_ERROR_TEXT,
  PASSWORDS_MUST_MATCH_ERROR_TEXT,
  TOO_SHORT,
  TOO_SHORT_PASSWORD_ERROR_TEXT,
  VALID,
} from '../support/assertion';
import { generateEmail } from '../support/helpers';

const { commonNewPasswordApiError, numericNewPasswordApiError } = API_ERROR_CODES;

export const RESET_PASSWORD_EMAIL = generateEmail(Cypress.env('EMAIL'), 'resetPassword');

export const RESET_PASSWORD_DATA = [
  {
    email: EMPTY_INPUT,
    emailState: EMPTY,
    errorText: [EMPTY_EMAIL_ERROR_TEXT],
  },
  {
    email: INVALID_EMAIL,
    emailState: INVALID,
    errorText: [INVALID_EMAIL_ERROR_TEXT],
  },
];

export const SET_NEW_PASSWORD_DATA = [
  {
    password: EMPTY_INPUT,
    passwordState: EMPTY,
    confirmPassword: EMPTY_INPUT,
    confirmPasswordState: EMPTY,
    errorText: [EMPTY_PASSWORD_ERROR_TEXT, EMPTY_REPEAT_NEW_PASSWORD_ERROR_TEXT],
  },
  {
    password: EMPTY_INPUT,
    passwordState: EMPTY,
    confirmPassword: VALID_PASSWORD,
    confirmPasswordState: VALID,
    errorText: [EMPTY_PASSWORD_ERROR_TEXT, PASSWORDS_MUST_MATCH_ERROR_TEXT],
  },
  {
    password: VALID_PASSWORD,
    passwordState: VALID,
    confirmPassword: EMPTY_INPUT,
    confirmPasswordState: EMPTY,
    errorText: [EMPTY_REPEAT_NEW_PASSWORD_ERROR_TEXT],
  },
  {
    password: VALID_PASSWORD,
    passwordState: VALID,
    confirmPassword: COMMON_PASSWORD,
    confirmPasswordState: COMMON,
    errorText: [PASSWORDS_MUST_MATCH_ERROR_TEXT],
  },
  {
    password: TOO_SHORT_PASSWORD,
    passwordState: TOO_SHORT,
    confirmPassword: TOO_SHORT_PASSWORD,
    confirmPasswordState: TOO_SHORT,
    errorText: [TOO_SHORT_PASSWORD_ERROR_TEXT],
  },
  {
    password: COMMON_PASSWORD,
    passwordState: COMMON,
    confirmPassword: COMMON_PASSWORD,
    confirmPasswordState: COMMON,
    errorText: [COMMON_PASSWORD_ERROR_TEXT],
    apiErrorCode: commonNewPasswordApiError,
  },
  {
    password: NUMERIC_PASSWORD,
    passwordState: NUMERIC,
    confirmPassword: NUMERIC_PASSWORD,
    confirmPasswordState: NUMERIC,
    errorText: [NUMERIC_PASSWORD_ERROR_TEXT],
    apiErrorCode: numericNewPasswordApiError,
  },
];
