export default {
  auth: {
    username: Cypress.env('BASIC_AUTH_LOGIN'),
    password: Cypress.env('BASIC_AUTH_PASSWORD'),
  },
};
