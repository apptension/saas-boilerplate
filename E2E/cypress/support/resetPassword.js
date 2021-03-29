import { EMAIL_INPUT, SUBMIT_BTN } from './authentication';
import BASIC_AUTH_OPTIONS from '../fixtures/basicAuth';

const { URL_REGEX } = require('./gmailApi/gmail.api.constants');

export const NEW_PASSWORD_INPUT = '[name="newPassword"]';
export const CONFIRM_PASSWORD_INPUT = '[name="confirmPassword"]';
export const RESET_YOUR_PASSWORD = 'Reset your password';

export const useLinkFromEmail = (emailSubject) => {
  cy.getLinkFromEmail({
    emailSubject,
    linkRegex: URL_REGEX,
  }).then((link) => cy.visit(`${link}`, BASIC_AUTH_OPTIONS));
};

export const submitResetPasswordForm = (userEmail) => {
  cy.get(EMAIL_INPUT).type(userEmail);
  cy.get(SUBMIT_BTN).click();
};

export const setNewPassword = (password, confirmPassword) => {
  cy.get(NEW_PASSWORD_INPUT).type(password);
  cy.get(CONFIRM_PASSWORD_INPUT).type(confirmPassword);
  cy.get(SUBMIT_BTN).click();
};

export const resetPassword = ({ userEmail, password, confirmPassword }) => {
  submitResetPasswordForm(userEmail);

  useLinkFromEmail(RESET_YOUR_PASSWORD);

  cy.url().should('include', '/auth/reset-password/confirm');
  cy.get('h1').should('have.text', 'Change your password').and('be.visible');

  setNewPassword(password, confirmPassword);
};

const getTokenFromPasswordResetLink = (link) => link.split('/')[8];

const getUserIdFromPasswordResetLink = (link) => link.split('/')[7];

export const sendResetPasswordLinkWithApi = (email) => {
  cy.request({
    method: 'POST',
    url: '/api/password-reset/',
    body: {
      email,
    },
  });
};

export const setNewPasswordWithApi = (password) => {
  cy.getLinkFromEmail({
    emailSubject: 'Reset your password',
    linkRegex: URL_REGEX,
  }).then((link) => {
    const token = getTokenFromPasswordResetLink(link);
    const user = getUserIdFromPasswordResetLink(link);

    cy.request({
      method: 'POST',
      url: '/api/password-reset/confirm/',
      body: {
        new_password: password,
        token,
        user,
      },
    });
  });
};
