import {
  expectLoginPageToMatchDesign,
  expectUserToBeLoggedOut,
  expectUserToBeLoggedIn,
  logInWithUI,
  logOut,
} from '../support/authentication';
import LOGIN_DATA from '../fixtures/loginData';
import BASIC_AUTH from '../fixtures/basicAuth';
import { expectErrorTextToBeDisplayed, expectRequestToSucceed } from '../support/helpers';
import { VALID_FIRST_NAME, VALID_LAST_NAME } from '../fixtures/profileData';

describe('Login page', () => {
  beforeEach(() => {
    cy.visit('/', BASIC_AUTH);
  });

  it('should log in', () => {
    cy.intercept('POST', '/api/auth/logout/').as('logout');
    const userEmail = Cypress.env('LOGIN_EMAIL');
    const password = Cypress.env('PASSWORD');

    expectLoginPageToMatchDesign();
    logInWithUI({ userEmail, password });
    expectUserToBeLoggedIn({
      userEmail,
      firstName: VALID_FIRST_NAME,
      lastName: VALID_LAST_NAME,
      userRoles: ['user'],
    });

    logOut();
    expectRequestToSucceed('@logout', 200);
    expectUserToBeLoggedOut();
  });

  LOGIN_DATA.forEach((item) => {
    const { userEmail, password, emailState, passwordState, errorText } = item;

    it(`should not log in with ${emailState} email and ${passwordState} password`, () => {
      logInWithUI({ userEmail, password });

      expectErrorTextToBeDisplayed(errorText);
      expectUserToBeLoggedOut();
    });
  });
});
