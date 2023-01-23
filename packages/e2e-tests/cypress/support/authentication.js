import { expectHeaderToBeDisplayed, openMenu } from './header';

export const EMAIL_INPUT = '[name="email"]';
export const PASSWORD_INPUT = '[name="password"]';
export const SUBMIT_BTN = '[type="submit"]';
export const RESET_PASSWORD_BTN = '[href$="/auth/reset-password"]';
export const SIGNUP_BTN = '[href$="/auth/signup"]';

export const logInWithUI = ({ userEmail, password }) => {
  cy.get(EMAIL_INPUT).type(userEmail);
  cy.get(PASSWORD_INPUT).type(password, { sensitive: true });
  cy.get(SUBMIT_BTN).click();
};

Cypress.Commands.add('getJWTtoken', (email, password) =>
  cy
    .request({
      method: 'POST',
      url: '/api/auth/token/',
      body: {
        email,
        password,
      },
      headers: {
        Authorization: Cypress.env('BASIC_AUTH_HEADER'),
      },
    })
    .then((res) => res.body.access)
);

export const logOut = () => {
  openMenu();
  cy.get('header button').contains('Log out').click();
};

const calculateTokenLifeSpanInDays = (tokenExpirationDate, today = new Date()) =>
  Math.abs(Math.round((tokenExpirationDate * 1000 - today.getTime()) / (1000 * 3600 * 24)));

export const expectTokenToExist = () => {
  cy.generateAssertLog('token', 'cookies');
  cy.getCookie('token').then((cookie) => {
    const { name, value, domain, path, expiry, httpOnly, secure } = cookie;
    const tokenLifeSpan = calculateTokenLifeSpanInDays(expiry);

    expect(name).to.equal('token');
    expect(value).not.to.equal(null);
    expect(domain).to.equal(Cypress.env('domain'));
    expect(path).to.equal('/');
    expect(tokenLifeSpan).to.equal(14);
    expect(httpOnly).to.equal(true);
    expect(secure).to.equal(false);
  });
};

export const getToken = () => cy.getCookie('token').then((token) => token.value);

Cypress.Commands.add('getTokens', () => {
  cy.getCookie('token').then((token) => {
    const access = token.value;
    cy.getCookie('refresh_token').then((refreshToken) => {
      const refresh = refreshToken.value;
      return cy.wrap({ access, refresh });
    });
  });
});

export const getUserInfo = () =>
  cy.request({
    url: '/api/auth/me/',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

export const expectUserToBeLoggedIn = ({
  userEmail,
  firstName = '',
  lastName = '',
  userRoles = ['user'],
}) => {
  cy.location('pathname').should('equal', '/en/');
  expectTokenToExist();
  expectHeaderToBeDisplayed();
  getUserInfo().then((res) => {
    const { email, first_name, last_name, roles, id } = res.body;

    expect(email).to.equal(userEmail);
    expect(first_name).to.equal(firstName);
    expect(last_name).to.equal(lastName);
    expect(roles).to.eql(userRoles);
    expect(id).to.be.a('string').and.to.have.length.gte(1);
  });
};

export const expectUserToBeLoggedOut = () => {
  cy.getCookie('token').should('be.null');
};

export const expectLoginPageToMatchDesign = () => {
  cy.get('h1').should('have.text', 'Log in').and('be.visible');
  cy.get(EMAIL_INPUT).should('be.visible').and('be.empty');
  cy.get(PASSWORD_INPUT).should('be.visible').and('be.empty');
  cy.get(SUBMIT_BTN).should('be.visible').and('be.enabled');
  cy.get('button').contains('Log in with Google').should('be.visible').and('be.enabled');
  cy.get('button').contains('Log in with Facebook').should('be.visible').and('be.enabled');
  cy.get(RESET_PASSWORD_BTN).should('be.visible');
  cy.get(SIGNUP_BTN).should('be.visible');
};
