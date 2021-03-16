const path = require('path');
const jsdom = require('jsdom');
const readline = require('readline');
const googleapis = require('googleapis');
const fs = require('fs');

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const {
  BASE64,
  UTF8,
  USER_ID,
  SCOPES,
  TOKEN_PATH,
  TOKEN_SUCCESS_MSG,
  TOKEN_AUTHORIZE_PROMPT,
  TOKEN_ENTER_CODE_PROMPT,
  TOKEN_ERROR_MSG,
  V1,
  OFFLINE,
} = require('./gmail.api.constants');

const { google } = googleapis;
const gmail = google.gmail(V1);

const getNewToken = async (oAuth2Client) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: OFFLINE,
    scope: SCOPES,
  });

  console.log(TOKEN_AUTHORIZE_PROMPT, authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(TOKEN_ENTER_CODE_PROMPT, (code) => {
    rl.close();
    oAuth2Client.getToken(code, (getTokenErr, token) => {
      if (getTokenErr) return console.error(TOKEN_ERROR_MSG, getTokenErr);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        return console.log(TOKEN_SUCCESS_MSG, TOKEN_PATH);
      });
      return oAuth2Client;
    });
  });
};

const getAuth = async (tokens) => {
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const clientId = process.env.GMAIL_CLIENT_ID;
  const redirectUris = process.env.GMAIL_REDIRECT_URIS.split(',');
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUris[0]);
  const newToken = !tokens.access_token ? await getNewToken(oAuth2Client) : tokens;
  oAuth2Client.setCredentials(newToken);
  return oAuth2Client;
};

const deleteEmailPromise = (auth, emailId) =>
  new Promise((resolve, reject) => {
    return gmail.users.messages.delete(
      {
        auth,
        userId: USER_ID,
        id: emailId,
      },
      (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      }
    );
  });

const getEmailTextPromise = (auth, emailId) =>
  new Promise((resolve, reject) => {
    gmail.users.messages.get(
      {
        auth,
        userId: USER_ID,
        id: emailId,
      },
      (err, res) => {
        const emailBody = {
          html: '',
          text: '',
        };

        if (err) {
          return reject(err);
        }
        if (!res.data.payload) {
          return reject(new Error(err));
        }

        const { body } = res.data.payload;

        if (body.size) {
          switch (res.data.payload.mimeType) {
            case 'text/html':
              emailBody.html = Buffer.from(body.data, BASE64).toString(UTF8);
              break;
            case 'text/plain':
              emailBody.text = Buffer.from(body.data, BASE64).toString(UTF8);
              break;
            default:
              console.log('Unknown MIME type');
              break;
          }
        }

        if (res.data.payload.parts) {
          const { data } = res.data.payload.parts[0].body;

          switch (res.data.payload.parts.mimeType) {
            case 'text/html':
              emailBody.html = Buffer.from(data, BASE64).toString(UTF8);
              break;
            case 'text/plain':
              emailBody.text = Buffer.from(data, BASE64).toString(UTF8);
              break;
            default:
              console.log('Unknown MIME type');
              break;
          }
        }

        return resolve(emailBody);
      }
    );
  });

const getEmailIdPromise = (auth, query) =>
  new Promise((resolve, reject) => {
    gmail.users.messages.list(
      {
        auth,
        userId: USER_ID,
        q: query,
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }
        if (!res.data.messages) {
          return reject(new Error(err));
        }
        return resolve(res.data.messages[0].id);
      }
    );
  });

const getEmailsPromise = (auth, query) =>
  new Promise((resolve, reject) => {
    gmail.users.messages.list(
      {
        auth,
        userId: USER_ID,
        q: query,
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res?.data?.messages?.map((message) => message.id));
      }
    );
  });

const getEmailId = async (auth, query) => {
  try {
    return await getEmailIdPromise(auth, query);
  } catch (err) {
    return console.log(err);
  }
};

const getEmailText = async (auth, emailId) => {
  try {
    return await getEmailTextPromise(auth, emailId);
  } catch (err) {
    return console.log(err);
  }
};

const getEmails = async (auth, query) => {
  try {
    return await getEmailsPromise(auth, query);
  } catch (err) {
    return console.log(`No emails found: ${err}`);
  }
};

const deleteEmail = async (auth, emailId) => {
  try {
    return await deleteEmailPromise(auth, emailId);
  } catch (err) {
    return console.log(err);
  }
};

const isEmailExisting = async (auth, query) => {
  const emails = await getEmails(auth, query);
  return emails !== undefined;
};

const deleteEmails = async (auth, query, emails) => {
  try {
    if (await isEmailExisting(auth, query)) {
      return await Promise.all(
        emails.map(async (email) => {
          await deleteEmail(auth, email);
        })
      );
    }
    return {};
  } catch (err) {
    return console.log(err);
  }
};

const getLinksFromHtmlEmailBody = async (emailBody) => {
  const dom = new jsdom.JSDOM(emailBody).window.document;
  const links = dom.getElementsByTagName('a');

  return Array.prototype.slice.call(links).map((a) => a.href);
};

const getLinksFromTextEmailBody = async (emailText, regexp) => emailText.match(regexp);

const getLinksFromEmailBody = async (emailBody, urlRegex) => {
  return emailBody.html.length
    ? getLinksFromHtmlEmailBody(emailBody.html)
    : getLinksFromTextEmailBody(emailBody.text, urlRegex);
};

const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/* eslint-disable no-await-in-loop */
const waitForEmail = async (auth, query) => {
  let email = false;
  while (!email) {
    email = await isEmailExisting(auth, query);
    await delay(1000);
  }
};

module.exports = {
  getAuth,
  getEmails,
  deleteEmails,
  waitForEmail,
  getEmailText,
  getEmailId,
  getLinksFromEmailBody,
};
