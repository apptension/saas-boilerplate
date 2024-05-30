const rootConfig = require('../../../eslint.config.js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat();

module.exports = [
  ...rootConfig,
  {
    ignores: ['!**/*', 'node_modules/**/*'],
  },
  ...compat.config({ parser: 'jsonc-eslint-parser' }).map((config) => ({
    ...config,
    files: ['./package.json', './generators.json', './executors.json'],
    rules: {
      '@nx/nx-plugin-checks': 'error',
    },
  })),
];
