module.exports = {
  baseTokens: {
    access_token: process.env.GMAIL_ACCESS_TOKEN,
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    scope: 'https://mail.google.com/',
    token_type: 'Bearer',
    expiry_date: 1615222540018,
  },
};
