const rootConfig = require('../../eslint.config.js');

module.exports = [
  ...rootConfig,
  {
    ignores: [
      '!**/*',
      'node_modules/**/*',
      'cdk.out/**/*',
      '__pypackages__/**/*',
      'apps/finances/static/djstripe/jquery.modal.min.js',
    ],
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {},
  },
];
