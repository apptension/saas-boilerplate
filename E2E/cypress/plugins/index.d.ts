declare namespace Cypress {
  interface Chainable {
    shouldHaveColor(arg0: string);
    /**
     * Custom command for getting JWT token need for authorization
     * Get the token in before hook - it will be stored in cookies
     * Wrap the token and store it as an alias in beforeEach hook
     * so it can be accessed and used in tests that rely on API requests
     * @example
     * cy.getJWTtoken('user@test.com, 'pass1234');
     */
    getJWTtoken(email: string, password: string);

    /**
     * Custom command for getting a link from email
     * @example
     * cy.getLinkFromEmail({query: 'Confirm your account', linkRegex: /regex/g});
     */
    getLinkFromEmail(object: { emailSubject: string; linkRegex: any });

    /**
     * Custom command to generate logs for assertion to visually group assertions within a single test
     * @example
     * cy.generateAssertLog('project', 'Public API');
     */
    generateAssertLog(entity: string, location: string);

    /**
     * Custom command to generate logs showing the number of entities with a given title that are going to be deleted
     * @example
     * cy.generateDeleteLog('E2E Cypress', arrLength);
     */
    generateDeleteLog(entity: string, title: string);

    /**
     * Custom command for getting tokens from cookies
     * @example
     * cy.getTokens().then(tokens => { // do something with tokens });
     */
    getTokens();
    interceptGraphQl(opName: string): Chainable;
  }
}
