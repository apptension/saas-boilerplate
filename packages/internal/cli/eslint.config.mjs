import rootConfig from '../../../eslint.config.js';

export default [
  ...rootConfig,
  {
    ignores: ['!**/*', 'node_modules/**/*', 'dist/**/*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-extra-semi': 'error',
    },
  },
];
