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
