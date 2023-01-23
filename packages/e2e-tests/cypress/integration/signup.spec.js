import SIGNUP_DATA, { SIGNUP_EMAIL } from '../fixtures/signupData';
import BASIC_AUTH_OPTIONS from '../fixtures/basicAuth';
import {
  deleteEmails,
  expectErrorTextToBeDisplayed,
  expectRequestToFail,
  expectSnackbarToBeDisplayed,
  randomizeEmail,
} from '../support/helpers';
import {
  expectLoginPageToMatchDesign,
  expectTokenToExist,
  expectUserToBeLoggedIn,
  expectUserToBeLoggedOut,
} from '../support/authentication';
import {
  CONFIRM_YOUR_ACCOUNT,
  createAccountWithApi,
  createAccountWithUI,
  expectAccountToBeCreated,
  LOGIN_LINK,
  PRIVACY_POLICY_LINK,
  TERMS_PAGE_LINK,
} from '../support/signup';
import { useLinkFromEmail } from '../support/resetPassword';
import { SIGNUP_SNACKBAR_TEXT } from '../support/assertion';

describe('Signup', () => {
  beforeEach(() => {
    cy.visit('/auth/signup/', BASIC_AUTH_OPTIONS);
  });

  describe('Navigation', () => {
    it('Can navigate to the login page', () => {
      cy.get(LOGIN_LINK).click();
      cy.url().should('include', '/auth/login');
      expectLoginPageToMatchDesign();
    });

    it('Can navigate to the Terms and conditions page', () => {
      cy.get(TERMS_PAGE_LINK).click();
      cy.url().should('include', 'terms-and-conditions');
      cy.get('h1').should('have.text', 'Terms and Conditions');
    });

    it('Can navigate to the Privacy policy page', () => {
      cy.get(PRIVACY_POLICY_LINK).click();
      cy.url().should('include', 'privacy-policy');
      cy.get('h1').should('have.text', 'Privacy policy');
    });
  });

  describe('Account creation', () => {
    it('Can create a new account', () => {
      cy.intercept('POST', '/api/auth/signup/').as('signupRequest');
      const userEmail = randomizeEmail(SIGNUP_EMAIL);
      const password = Cypress.env('PASSWORD');

      createAccountWithUI({ userEmail, password });

      cy.wait('@signupRequest').then((apiResp) => {
        expectAccountToBeCreated(apiResp.response, userEmail);
        expectUserToBeLoggedIn({ userEmail, firstName: '', lastName: '', userRoles: ['user'] });
      });
    });

    it('Can confirm a new account using a link from an email', () => {
      deleteEmails('Confirm your account');
      const userEmail = randomizeEmail(SIGNUP_EMAIL);
      const password = Cypress.env('PASSWORD');

      createAccountWithApi(userEmail, password).then((res) => {
        expectAccountToBeCreated(res, userEmail);
      });

      useLinkFromEmail(CONFIRM_YOUR_ACCOUNT);

      cy.url().should('equal', `${Cypress.config().baseUrl}/en/`);
      expectSnackbarToBeDisplayed(SIGNUP_SNACKBAR_TEXT);
      expectTokenToExist();
    });
  });

  describe('Should not create an account if:', () => {
    SIGNUP_DATA.forEach((item) => {
      const {
        userEmail,
        emailState,
        password,
        passwordState,
        checkbox,
        checkboxState,
        errorText,
        apiError,
      } = item;

      it(`email is ${emailState}, password is ${passwordState} and checkbox is ${checkboxState}`, () => {
        cy.intercept('POST', '/api/auth/signup/').as('signupRequest');

        createAccountWithUI({ userEmail, password, checkbox });

        expectRequestToFail('@signupRequest', apiError);
        expectErrorTextToBeDisplayed(errorText);
        expectUserToBeLoggedOut();
      });
    });
  });
});
