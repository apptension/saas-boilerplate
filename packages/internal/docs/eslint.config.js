const rootConfig = require('../../../eslint.config.js');

module.exports = [
  ...rootConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'import/no-unresolved': [2, { ignore: ['^@docusaurus', '^@theme'] }],
    },
  },
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
      'node_modules/**/*',
      'build/**/*',
      '**/.docusaurus/**/*',
      'cdk.out/**/*',
    ],
  },
];
