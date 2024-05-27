const baseConfig = require('../../../eslint.config.js');

module.exports = [
  ...baseConfig,
  { ignores: ['node_modules/**/*', 'build/**/*', 'cdk.out/**/*'] },
];
