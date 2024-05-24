const webappCoreConfig = require('@sb/webapp-core/eslint.config.js');

const rootConfig = require('../../eslint.config.js');

module.exports = [
  ...rootConfig,
  ...webappCoreConfig,
  {
    ignores: [
      'scripts/*',
      'config/*',
      'plop/*',
      'build/**/*',
      'cdk.out/**/*',
      'storybook-static',
      'plopfile.js',
      'setupTests.js',
    ],
  },
];
