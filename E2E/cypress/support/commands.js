import 'cypress-audit/commands';

Cypress.Commands.overwrite('type', (originalFn, element, text, options) => {
  if (options && options.sensitive) {
    options.log = false;
    Cypress.log({
      $el: element,
      name: 'type',
      message: '*'.repeat(text.length),
    });
  }

  const clearedText = `{selectall}{backspace}${text}`;
  return originalFn(element, clearedText, options);
});

Cypress.Commands.add('interceptGraphQl', (query) => {
  cy.intercept('POST', '/api/graphql/', (req) => {
    if (req.body.query.includes(query)) {
      req.alias = query;
    }
  });
});

Cypress.Commands.add('shouldHaveColor', { prevSubject: true }, (subject, color) => {
  cy.wrap(subject).should('have.css', 'color', color);
});
