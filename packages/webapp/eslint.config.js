const webappCoreConfig = require('@sb/webapp-core/eslint.config.js');

module.exports = [
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
