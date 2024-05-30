const rootConfig = require('../../eslint.config.js');

module.exports = [
  ...rootConfig,
  {
    ignores: [
      '!**/*',
      'node_modules/**/*',
      'emails/renderer/index.umd.js',
      '__pypackages__/**/*',
      '.serverless/**/*',
      'htmlcov/**/*',
    ],
  },
];
