import BASIC_AUTH from '../fixtures/basicAuth';

const thresholds = {
  performance: 70,
  accessibility: 80,
  seo: 70,
  'best-practices': 80,
  'first-contentful-paint': 4000,
  'largest-contentful-paint': 6000,
};

const desktopConfig = {
  formFactor: 'desktop',
  screenEmulation: { disabled: true },
};

const mobileConfig = {
  formFactor: 'mobile',
  screenEmulation: { disabled: false },
};

const userEmail = Cypress.env('EMAIL');
const password = Cypress.env('PASSWORD');

describe.skip('Lighthouse audit - desktop', () => {
  describe('Unauthorized pages - should pass on:', () => {
    it('Login page', () => {
      cy.visit('/', BASIC_AUTH);
      cy.lighthouse(thresholds, desktopConfig);
    });

    it('Signup page', () => {
      cy.visit('/en/auth/signup', BASIC_AUTH);
      cy.lighthouse(thresholds, desktopConfig);
    });

    it('Reset password page', () => {
      cy.visit('/en/auth/reset-password', BASIC_AUTH);
      cy.lighthouse(thresholds, desktopConfig);
    });
  });

  describe('Authorized pages - should pass on:', () => {
    beforeEach(() => {
      cy.getJWTtoken(userEmail, password);
    });

    it('Home page', () => {
      cy.visit('/en/', BASIC_AUTH);
      cy.lighthouse(thresholds, desktopConfig);
    });

    it('Profile page', () => {
      cy.visit('/en/profile', BASIC_AUTH);
      cy.lighthouse(thresholds, desktopConfig);
    });

    it('Contenful demo page', () => {
      cy.visit('/en/demo-items', BASIC_AUTH);
      cy.lighthouse(thresholds, desktopConfig);
    });

    it('CRUD demo page', () => {
      cy.visit('/en/crud-demo-item/', BASIC_AUTH);
      cy.lighthouse(thresholds, desktopConfig);
    });

    it('Payments demo page', () => {
      cy.visit('/en/finances/payment-confirm', BASIC_AUTH);
      cy.lighthouse(thresholds, desktopConfig);
    });

    it('Terms page', () => {
      cy.visit('/en/terms-and-conditions', BASIC_AUTH);
      cy.lighthouse(thresholds, desktopConfig);
    });

    it('Privacy page', () => {
      cy.visit('/en/privacy-policy', BASIC_AUTH);
      cy.lighthouse(thresholds, desktopConfig);
    });
  });
});

describe.skip('Lighthouse audit - mobile', () => {
  describe('Unauthorized pages - should pass on:', () => {
    it('Login page', () => {
      cy.visit('/', BASIC_AUTH);
      cy.lighthouse(thresholds, mobileConfig);
    });

    it('Signup page', () => {
      cy.visit('/en/auth/signup', BASIC_AUTH);
      cy.lighthouse(thresholds, mobileConfig);
    });

    it('Reset password page', () => {
      cy.visit('/en/auth/reset-password', BASIC_AUTH);
      cy.lighthouse(thresholds, mobileConfig);
    });
  });

  describe('Authorized pages - should pass on:', () => {
    beforeEach(() => {
      cy.getJWTtoken(userEmail, password);
    });

    it('Home page', () => {
      cy.visit('/en/', BASIC_AUTH);
      cy.lighthouse(thresholds, mobileConfig);
    });

    it('Profile page', () => {
      cy.visit('/en/profile', BASIC_AUTH);
      cy.lighthouse(thresholds, mobileConfig);
    });

    it('Contenful demo page', () => {
      cy.visit('/en/demo-items', BASIC_AUTH);
      cy.lighthouse(thresholds, mobileConfig);
    });

    it('CRUD demo page', () => {
      cy.visit('/en/crud-demo-item/', BASIC_AUTH);
      cy.lighthouse(thresholds, mobileConfig);
    });

    it('Payments demo page', () => {
      cy.visit('/en/finances/payment-confirm', BASIC_AUTH);
      cy.lighthouse(thresholds, mobileConfig);
    });

    it('Terms page', () => {
      cy.visit('/en/terms-and-conditions', BASIC_AUTH);
      cy.lighthouse(thresholds, mobileConfig);
    });

    it('Privacy page', () => {
      cy.visit('/en/privacy-policy', BASIC_AUTH);
      cy.lighthouse(thresholds, mobileConfig);
    });
  });
});
