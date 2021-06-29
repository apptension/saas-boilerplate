const promptDirectory = require('inquirer-directory');

const addReduxModuleGenerator = require('./plop/reduxModule');
const addReactComponentGenerator = require('./plop/reactComponent');
const addReactHookGenerator = require('./plop/reactHook');
const addApiModelGenerator = require('./plop/apiModel');
const addCrudGenerator = require('./plop/crud');
const addIconRegisterGenerator = require('./plop/icon');
const addNotificationGenerator = require('./plop/notification');
const addEmailGenerator = require('./plop/email');

module.exports = function (plop) {
  plop.setPrompt('directory', promptDirectory);
  plop.setHelper('append', (text) => text);

  [
    addReduxModuleGenerator,
    addReactComponentGenerator,
    addReactHookGenerator,
    addApiModelGenerator,
    addCrudGenerator,
    addIconRegisterGenerator,
    addNotificationGenerator,
    addEmailGenerator,
  ].forEach((generator) => generator(plop));
};
