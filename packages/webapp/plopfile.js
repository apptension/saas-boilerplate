const promptDirectory = require('inquirer-directory');

module.exports = function (plop) {
  plop.setPrompt('directory', promptDirectory);
  plop.setHelper('append', (text) => text);

  [
    require('./plop/reduxModule'),
    require('./plop/reactComponent'),
    require('./plop/reactHook'),
    require('./plop/apiModel'),
    require('./plop/crud'),
    require('./plop/icon'),
    require('./plop/notification'),
    require('./plop/email'),
  ].forEach((generator) => generator(plop));
};
