import crypto from 'crypto';
import BASIC_AUTH from '../fixtures/basicAuth';
import {
  VALID_PROFILE_DATA,
  INVALID_PROFILE_DATA,
  CHANGE_PASSWORD_EMAIL,
} from '../fixtures/profileData';
import CHANGE_PASSWORD_DATA from '../fixtures/changePasswordData';
import { UserProfileResponseFactory, updateUserProfile, updatePassword } from '../support/profile';
import {
  expectUserToBeLoggedIn,
  getUserInfo,
  logInWithUI,
  logOut,
} from '../support/authentication';
import {
  deleteEmails,
  expectErrorTextToBeDisplayed,
  expectRequestToFail,
  expectRequestToSucceed,
  expectSnackbarToBeDisplayed,
} from '../support/helpers';
import {
  RESET_YOUR_PASSWORD,
  sendResetPasswordLinkWithApi,
  setNewPasswordWithApi,
} from '../support/resetPassword';
import {
  PROFILE_UPDATED_SNACKBAR_TEXT,
  UNEXPECTED_ERROR_SNACKBAR_TEXT,
} from '../support/assertion';

const password = Cypress.env('PASSWORD');

describe('Change first name and last name', () => {
  const userEmail = Cypress.env('EMAIL');

  beforeEach(() => {
    cy.getJWTtoken(userEmail, password);
    cy.visit('/en/profile', BASIC_AUTH);
  });

  VALID_PROFILE_DATA.forEach((profileData) => {
    const { firstName, lastName, inputName } = profileData;

    it(`user can update their ${inputName}`, () => {
      cy.intercept('PUT', '/api/auth/me/').as('profileUpdate');

      getUserInfo().then((userInfo) => {
        const response = UserProfileResponseFactory(userInfo.body, { firstName, lastName });

        updateUserProfile({ firstName, lastName });
        expectRequestToSucceed('@profileUpdate', 200, response);
        expectSnackbarToBeDisplayed(PROFILE_UPDATED_SNACKBAR_TEXT);
      });
    });
  });

  INVALID_PROFILE_DATA.forEach((profileData) => {
    const { firstName, lastName, inputName, errorText } = profileData;

    it(`user should not update ${inputName} if it is too long`, () => {
      updateUserProfile({ firstName, lastName });
      expectErrorTextToBeDisplayed(errorText);
    });
  });
});

describe('Change password', () => {
  const userEmail = CHANGE_PASSWORD_EMAIL;
  const oldPassword = Cypress.env('PASSWORD');
  const newPassword = crypto.randomBytes(10).toString('hex');

  before(() => {
    deleteEmails(RESET_YOUR_PASSWORD);
    sendResetPasswordLinkWithApi(userEmail);
    setNewPasswordWithApi(oldPassword);
    cy.getJWTtoken(userEmail, oldPassword);
    cy.visit('/en/profile', BASIC_AUTH);
  });

  it('user can update their password', () => {
    cy.intercept('POST', '/api/auth/change-password/').as('updatePassword');

    cy.getTokens().then((oldTokens) => {
      updatePassword({ oldPassword, newPassword, confirmPassword: newPassword });

      cy.wait('@updatePassword').then((apiRes) => {
        expect(apiRes.response.statusCode).to.equal(201);
        expect(apiRes.response.body).not.to.eql(oldTokens);
      });

      logOut();
      cy.url().should('include', '/auth/login');

      logInWithUI({ userEmail, password: newPassword });
      expectUserToBeLoggedIn({ userEmail });
    });
  });
});

describe('Should not update a password if: ', () => {
  const userEmail = Cypress.env('EMAIL');
  const basePassword = Cypress.env('PASSWORD');

  beforeEach(() => {
    cy.getJWTtoken(userEmail, basePassword);
    cy.visit('/en/profile', BASIC_AUTH);
  });

  CHANGE_PASSWORD_DATA.forEach((passwordData) => {
    const {
      oldPassword,
      oldPasswordState,
      newPassword,
      newPasswordState,
      confirmPassword,
      confirmPasswordState,
      errorText,
      apiErrorCode,
    } = passwordData;

    it(`- old password is ${oldPasswordState}, 
        - new password is ${newPasswordState} 
        - and confirm password is ${confirmPasswordState}`, () => {
      cy.intercept('POST', '/api/auth/change-password/').as('changePassword');

      updatePassword({ oldPassword, newPassword, confirmPassword });

      expectErrorTextToBeDisplayed(errorText);
      expectRequestToFail('@changePassword', apiErrorCode);
    });
  });
});

describe('Snackbar', () => {
  const userEmail = Cypress.env('EMAIL');

  beforeEach(() => {
    cy.getJWTtoken(userEmail, password);
    cy.visit('/en/profile', BASIC_AUTH);
  });

  it('should show a snackbar for unexpected error', () => {
    cy.intercept('PUT', '/api/auth/me/', { statusCode: 500 }).as('unexpectedError');

    updateUserProfile({ firstName: 'this', lastName: 'should fail' });

    cy.wait('@unexpectedError').then(() =>
      expectSnackbarToBeDisplayed(UNEXPECTED_ERROR_SNACKBAR_TEXT)
    );
  });
});
