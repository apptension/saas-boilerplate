const rootConfig = require('../../../eslint.config.js');

module.exports = [
  ...rootConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {},
  },
  {
    ignores: [
      '**/node_modules/**/*',
      '**/cdk.out/**/*',
      '**/src/lib/patterns/ecr-sync/**/*',
    ],
  },
];
