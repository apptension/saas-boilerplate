const webappCoreConfig = require('@sb/webapp-core/eslint.config.js');

module.exports = [
  ...webappCoreConfig,
  {
    ignores: ['src/graphql/__generated'],
  },
];
