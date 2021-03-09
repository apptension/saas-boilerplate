const { getAuth } = require('./gmail.api.js');
const { baseTokens } = require('./token');

// run this from the terminal to obtain the token.json file
(async () => {
  await getAuth(baseTokens);
})();
