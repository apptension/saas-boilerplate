import { EMPTY_INPUT } from './signupData';
import { FIRST_NAME_IS_TOO_LONG_ERROR, LAST_NAME_IS_TOO_LONG_ERROR } from '../support/assertion';
import { generateEmail } from '../support/helpers';

export const CHANGE_PASSWORD_EMAIL = generateEmail(Cypress.env('EMAIL'), 'changePassword');
export const VALID_FIRST_NAME = 'John';
export const VALID_LAST_NAME = 'Doe';
const FIRST_NAME = 'first name';
const LAST_NAME = 'last name';
const FIRST_AND_LAST_NAME = 'first and last name';
const TOO_LONG_FIRST_NAME = 'a'.repeat(41);
const TOO_LONG_LAST_NAME = 'a'.repeat(41);

export const VALID_PROFILE_DATA = [
  {
    firstName: VALID_FIRST_NAME,
    inputName: FIRST_NAME,
    lastName: EMPTY_INPUT,
  },
  {
    firstName: EMPTY_INPUT,
    lastName: VALID_LAST_NAME,
    inputName: LAST_NAME,
  },
  {
    firstName: VALID_FIRST_NAME,
    lastName: VALID_LAST_NAME,
    inputName: FIRST_AND_LAST_NAME,
  },
];

export const INVALID_PROFILE_DATA = [
  {
    firstName: TOO_LONG_FIRST_NAME,
    inputName: FIRST_NAME,
    lastName: EMPTY_INPUT,
    errorText: [FIRST_NAME_IS_TOO_LONG_ERROR],
  },
  {
    firstName: EMPTY_INPUT,
    lastName: TOO_LONG_LAST_NAME,
    inputName: LAST_NAME,
    errorText: [LAST_NAME_IS_TOO_LONG_ERROR],
  },
  {
    firstName: TOO_LONG_FIRST_NAME,
    lastName: TOO_LONG_LAST_NAME,
    inputName: FIRST_AND_LAST_NAME,
    errorText: [FIRST_NAME_IS_TOO_LONG_ERROR, LAST_NAME_IS_TOO_LONG_ERROR],
  },
];
