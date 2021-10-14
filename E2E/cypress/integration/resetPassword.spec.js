import crypto from 'crypto';

import BASIC_AUTH from '../fixtures/basicAuth';
import {
  RESET_PASSWORD_DATA,
  RESET_PASSWORD_EMAIL,
  SET_NEW_PASSWORD_DATA,
} from '../fixtures/resetPasswordData';
import {
  useLinkFromEmail,
  RESET_YOUR_PASSWORD,
  resetPassword,
  sendResetPasswordLinkWithApi,
  setNewPassword,
  setNewPasswordWithApi,
  submitResetPasswordForm,
} from '../support/resetPassword';
import {
  deleteEmails,
  expectErrorTextToBeDisplayed,
  expectLinkToExistInEmail,
  expectRequestNotToHappen,
  expectRequestToFail,
  expectRequestToSucceed,
} from '../support/helpers';
import {
  expectUserToBeLoggedIn,
  logInWithUI,
  expectUserToBeLoggedOut,
} from '../support/authentication';
import API_ERROR_CODES from '../fixtures/apiErrorCodes';
import { MALFORMED_RESET_TOKEN_ERROR_TEXT } from '../support/assertion';

const { URL_REGEX } = require('../support/gmailApi/gmail.api.constants');

const { malformedPasswordResetTokenApiError, noActiveAccountFoundApiError } = API_ERROR_CODES;

describe('Should reset a password if:', () => {
  beforeEach(() => {
    cy.visit('/auth/reset-password', BASIC_AUTH);
  });

  it('email and new password are valid', () => {
    deleteEmails('Reset your password');
    cy.intercept('POST', '/api/password-reset/confirm/').as('passwordReset');

    const userEmail = RESET_PASSWORD_EMAIL;
    const password = crypto.randomBytes(10).toString('hex');

    resetPassword({ userEmail, password, confirmPassword: password });
    expectRequestToSucceed('@passwordReset', 201);

    cy.visit('/auth/login', BASIC_AUTH);

    logInWithUI({ userEmail, password });
    expectUserToBeLoggedIn({ userEmail, firstName: '', lastName: '', userRoles: ['user'] });
  });
});

describe('Should not reset a password if:', () => {
  beforeEach(() => {
    cy.visit('/auth/reset-password', BASIC_AUTH);
  });

  it('the link was used before', () => {
    deleteEmails(RESET_YOUR_PASSWORD);
    cy.intercept('POST', '/api/password-reset/confirm/').as('passwordReset');

    const userEmail = RESET_PASSWORD_EMAIL;
    const password = crypto.randomBytes(10).toString('hex');
    const newPassword = crypto.randomBytes(10).toString('hex');

    sendResetPasswordLinkWithApi(userEmail);
    setNewPasswordWithApi(password);

    useLinkFromEmail(RESET_YOUR_PASSWORD);

    setNewPassword(newPassword, newPassword);
    expectRequestToFail('@passwordReset', malformedPasswordResetTokenApiError);

    expectErrorTextToBeDisplayed([MALFORMED_RESET_TOKEN_ERROR_TEXT]);

    cy.visit('/auth/login', BASIC_AUTH);
    cy.intercept('POST', '/api/auth/token/').as('login');

    logInWithUI({ userEmail, password: newPassword });
    expectUserToBeLoggedOut();
    expectRequestToFail('@login', noActiveAccountFoundApiError);
  });
});

describe('Should not receive a reset password email if:', () => {
  beforeEach(() => {
    cy.visit('/auth/reset-password', BASIC_AUTH);
  });

  RESET_PASSWORD_DATA.forEach((item) => {
    const { email, emailState, errorText } = item;

    // TODO add test for non-existing email once SB-326 is done
    it(`email is ${emailState} `, () => {
      cy.intercept('POST', '/api/password-reset/').as('passwordReset');

      submitResetPasswordForm(email);
      expectErrorTextToBeDisplayed(errorText);
    });
  });
});

describe('Password reset throttle', () => {
  const userEmail = RESET_PASSWORD_EMAIL;

  it('should not re-send a password reset link immediately', () => {
    cy.visit('/auth/reset-password', BASIC_AUTH);

    submitResetPasswordForm(userEmail);

    cy.intercept('POST', '/api/password-reset/').as('passwordReset');
    submitResetPasswordForm(userEmail);

    expectRequestNotToHappen('@passwordReset');
  });

  it('should re-send a password reset link 15 seconds after previous request happened', () => {
    cy.clock();
    cy.visit('/auth/reset-password', BASIC_AUTH);

    submitResetPasswordForm(userEmail);
    deleteEmails(RESET_YOUR_PASSWORD);

    cy.intercept('POST', '/api/password-reset/').as('passwordReset');
    submitResetPasswordForm(userEmail);

    cy.tick(15000);
    expectRequestToSucceed('@passwordReset', 201);
    expectLinkToExistInEmail({ emailSubject: RESET_YOUR_PASSWORD, linkRegex: URL_REGEX });
  });
});

describe('Should not reset a password if:', () => {
  let setNewPasswordLink;

  before(() => {
    deleteEmails(RESET_YOUR_PASSWORD);
    sendResetPasswordLinkWithApi(RESET_PASSWORD_EMAIL);

    cy.getLinkFromEmail({
      emailSubject: RESET_YOUR_PASSWORD,
      linkRegex: URL_REGEX,
    }).then((link) => {
      setNewPasswordLink = link;
    });
  });

  beforeEach(() => {
    cy.wrap(setNewPasswordLink).as('link');
  });

  SET_NEW_PASSWORD_DATA.forEach((item) => {
    const {
      password,
      passwordState,
      confirmPassword,
      confirmPasswordState,
      errorText,
      apiErrorCode,
    } = item;

    it(`password is ${passwordState} and confirm password is ${confirmPasswordState}`, () => {
      cy.intercept('POST', '/api/password-reset/confirm/').as('confirmPasswordReset');

      cy.get('@link').then((link) => cy.visit(`${link}`, BASIC_AUTH));

      setNewPassword(password, confirmPassword);
      expectRequestToFail('@confirmPasswordReset', apiErrorCode);
      expectErrorTextToBeDisplayed(errorText);
    });
  });
});
