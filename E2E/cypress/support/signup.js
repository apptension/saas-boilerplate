import { EMAIL_INPUT, PASSWORD_INPUT, SUBMIT_BTN } from './authentication';

export const TERMS_CHECKBOX = '[type="checkbox"]';
export const LOGIN_LINK = 'a[href$="/auth/login"]';
export const TERMS_PAGE_LINK = 'label a[href$="/terms-and-conditions"]';
export const PRIVACY_POLICY_LINK = 'label a[href$="/privacy-policy"]';
export const CONFIRM_YOUR_ACCOUNT = 'Confirm registration';

export const createAccountWithUI = ({ userEmail, password, checkbox = true }) => {
  cy.get(EMAIL_INPUT).type(userEmail);
  cy.get(PASSWORD_INPUT).type(password);
  if (checkbox) {
    cy.get(TERMS_CHECKBOX).check({ force: true });
  }
  cy.get(SUBMIT_BTN).click();
};

export const createAccountWithApi = (email, password) => {
  return cy.request({
    method: 'POST',
    url: '/api/auth/signup/',
    body: {
      email,
      password,
    },
    headers: {
      Authorization: Cypress.env('BASIC_AUTH_HEADER'),
    },
  });
};

export const expectAccountToBeCreated = (apiResp, userEmail) => {
  cy.generateAssertLog('account', 'BE');
  const { id, email, access, refresh } = apiResp.body;

  expect(apiResp.statusCode || apiResp.status).to.equal(201);
  expect(id).to.be.a('string').and.to.have.length.gte(1);
  expect(email).to.equal(userEmail);

  cy.getCookie('token').then((cookie) => {
    expect(cookie.value).to.equal(access);
  });

  cy.getCookie('refresh_token').then((cookie) => {
    expect(cookie.value).to.equal(refresh);
  });

  return apiResp.statusCode
    ? expect(apiResp.statusCode).to.equal(201)
    : expect(apiResp.status).to.equal(201);
};
