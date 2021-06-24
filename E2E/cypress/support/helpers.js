Cypress.Commands.add('getLinkFromEmail', ({ emailSubject, linkRegex }) => {
  cy.generateGetLog('the link from the email');
  cy.task('gmail:get-link-from-email', {
    emailSubject,
    linkRegex,
  }).then((link) => cy.wrap(link));
});

Cypress.Commands.add('generateAssertLog', (entity, location) => {
  Cypress.log({
    displayName: '🕵️‍🕵️‍🕵️‍',
    message: `**===== Asserting ${entity} 👉 ${location} =====**`,
  });
});

Cypress.Commands.add('generateDeleteLog', (entity, title) => {
  Cypress.log({
    displayName: '⚠️ ⚠️ ⚠️️️‍',
    message: `**Deleting ${entity}(s) starting with the title *"${title}"***`,
  });
});

Cypress.Commands.add('generateGetLog', (entity) => {
  Cypress.log({
    displayName: '🔁 🔁 🔁',
    message: `**Getting ${entity}**`,
  });
});

export const deleteEmails = (emailSubject) => {
  cy.generateDeleteLog('email', emailSubject);
  cy.task('gmail:delete-emails', emailSubject);
};

export const randomizeEmail = (email) => {
  const id = new Date().getTime().toString();
  const arr = Array.from(email);
  const index = email.indexOf('@');
  arr.splice(index, 0, '+', id);
  return arr.join('');
};

export const expectRequestToFail = (apiRequestAlias, apiErrorCode) => {
  if (typeof apiErrorCode !== 'undefined') {
    cy.wait(apiRequestAlias).then((res) => {
      const { body, statusCode } = res.response;
      expect(statusCode).to.equal(400);
      expect(body).to.eql(apiErrorCode);
    });
  }
};

export const expectRequestToSucceed = (apiRequestAlias, statusCode, response) =>
  cy.wait(apiRequestAlias).then((apiRes) => {
    expect(apiRes.response.statusCode).to.equal(statusCode);
    if (response) {
      expect(apiRes.response.body).to.eql(response);
    }
  });

export const expectErrorTextToBeDisplayed = (errorTextArr) =>
  errorTextArr.forEach((text) => {
    cy.contains(text).should('be.visible');
  });

export const expectSnackbarToBeDisplayed = (snackbarText) =>
  cy.get('header').contains(snackbarText).should('be.visible');

export const expectLinkToExistInEmail = ({ emailSubject, linkRegex }) => {
  cy.getLinkFromEmail({
    emailSubject,
    linkRegex,
  }).then((link) => expect(link).to.match(linkRegex));
};

export const generateEmail = (email, name) => {
  const arr = Array.from(email);
  const index = email.indexOf('@');
  arr.splice(index, 0, '+', name);
  return arr.join('');
};

export const expectRequestNotToHappen = (alias) => {
  cy.on('fail', (err) => {
    expect(err.message).to.include('No request ever occurred.');
    return false;
  });

  cy.wait(alias, { timeout: 1000 }).then(() => {
    throw new Error('Unexpected API call');
  });
};
