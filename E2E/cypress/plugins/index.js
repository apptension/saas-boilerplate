/// <reference types="cypress" />
require('dotenv').config();

const fse = require('fs-extra');
const path = require('path');
const { lighthouse, prepareAudit } = require('cypress-audit');
const { deleteEmails } = require('../support/GmailAPI/gmail.api');
const { getEmails } = require('../support/GmailAPI/gmail.api');
const { getLinksFromEmailBody } = require('../support/GmailAPI/gmail.api');
const { getEmailId } = require('../support/GmailAPI/gmail.api');
const { getEmailText } = require('../support/GmailAPI/gmail.api');
const { waitForEmail } = require('../support/GmailAPI/gmail.api');
const { getAuth } = require('../support/GmailAPI/gmail.api');
const { baseTokens } = require('../support/GmailAPI/token');

const getConfigurationByFile = (file) => {
  const pathToConfigFile = path.resolve('cypress', 'config', `${file}.json`);

  if (!fse.pathExistsSync(pathToConfigFile)) {
    console.warn(`No custom config file with the name ${file}.json was found.`);
    return {};
  }
  return fse.readJson(pathToConfigFile);
};

module.exports = (on, config) => {
  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (browser.name === 'chrome') {
      launchOptions.args.push('--lang=en-GB');
      launchOptions.args.push('--incognito');
      prepareAudit(launchOptions);
      return launchOptions;
    }
    return {};
  });

  on('task', {
    lighthouse: lighthouse(),
  });

  on('task', {
    'gmail:get-link-from-email': async ({ emailSubject, linkRegex }) => {
      const auth = await getAuth(baseTokens);
      await waitForEmail(auth, emailSubject);
      const emailBody = await getEmailText(auth, await getEmailId(auth, emailSubject));
      const links = await getLinksFromEmailBody(emailBody, linkRegex);
      return links[0];
    },
  });

  on('task', {
    'gmail:delete-emails': async (query) => {
      const auth = await getAuth(baseTokens);
      const emails = await getEmails(auth, query);
      await deleteEmails(auth, query, emails);
      return null;
    },
  });

  const file = config.env.configFile;
  return getConfigurationByFile(file);
};
