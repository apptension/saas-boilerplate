function createAppConfig(migration, context) {
  const appConfig = migration.createContentType('appConfig').name('App Config');

  const nameValue = 'Global App Config';
  const name = appConfig
    .createField('name')
    .name('Name')
    .type('Symbol')
    .required(true)
    .validations([{ in: [nameValue] }]);
  appConfig.changeFieldControl(name.id, 'builtin', 'dropdown');
  appConfig.displayField(name.id);

  const privacyPolicy = appConfig
    .createField('privacyPolicy')
    .name('Privacy policy')
    .type('Text')
    .required(true);
  appConfig.changeFieldControl(privacyPolicy.id, 'builtin', 'markdown');

  const termsAndConditions = appConfig
    .createField('termsAndConditions')
    .name('Terms and Conditions')
    .type('Text')
    .required(true);
  appConfig.changeFieldControl(termsAndConditions.id, 'builtin', 'markdown');
}

function createDemoItem(migration, context) {
  const demoItem = migration.createContentType('demoItem').name('Demo Item');

  const title = demoItem
    .createField('title')
    .name('Title')
    .type('Symbol')
    .required(true);
  demoItem.displayField(title.id);

  const description = demoItem
    .createField('description')
    .name('Description')
    .type('Text')
    .required(true);
  demoItem.changeFieldControl(description.id, 'builtin', 'markdown');

  demoItem.createField('image').name('Image').type('Symbol').required(true);
}

module.exports = function (migration, context) {
  createAppConfig(migration, context);
  createDemoItem(migration, context);
};
