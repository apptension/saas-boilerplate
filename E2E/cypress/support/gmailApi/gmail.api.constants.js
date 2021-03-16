const path = require('path');

const TOKEN_AUTHORIZE_PROMPT = 'Authorize this app by visiting this url:';
const TOKEN_ENTER_CODE_PROMPT = 'Enter the code from that page here: ';
const TOKEN_ERROR_MSG = 'Error retrieving access token';
const TOKEN_SUCCESS_MSG = 'Token stored to ';

const MARK_EMAIL_ERROR_MSG =
  'Failed to mark an email. Check your query and make sure the email exists.';
const MARK_EMAIL_SUCCESS_MSG = 'Successfully marked an email with ID: ';
const UNREAD = 'UNREAD';

const DELETE_EMAIL_ERROR_MSG =
  'Failed to delete an email. Check your query and make sure the email exists.';
const DELETE_EMAIL_SUCCESS_MSG = 'Successfully deleted an email with ID: ';

const EMAIL_ID_NOT_FOUND_MSG = 'EmailId is undefined. Check your query.';
const NO_EMAILS_FOUND_MSG = 'There are no emails for given query';

const TOKEN_PATH = path.resolve(__dirname, 'token.json');
const SCOPES = ['https://mail.google.com'];
const USER_ID = 'me';
const BASE64 = 'base64';
const UTF8 = 'utf8';
const V1 = 'v1';
const OFFLINE = 'offline';
const URL_REGEX = /((http|https):\/\/[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,3}(\/\S*)?)/g;

module.exports = {
  TOKEN_AUTHORIZE_PROMPT,
  TOKEN_ENTER_CODE_PROMPT,
  TOKEN_ERROR_MSG,
  TOKEN_SUCCESS_MSG,
  MARK_EMAIL_ERROR_MSG,
  MARK_EMAIL_SUCCESS_MSG,
  UNREAD,
  DELETE_EMAIL_ERROR_MSG,
  DELETE_EMAIL_SUCCESS_MSG,
  EMAIL_ID_NOT_FOUND_MSG,
  NO_EMAILS_FOUND_MSG,
  TOKEN_PATH,
  SCOPES,
  USER_ID,
  BASE64,
  UTF8,
  V1,
  OFFLINE,
  URL_REGEX,
};
