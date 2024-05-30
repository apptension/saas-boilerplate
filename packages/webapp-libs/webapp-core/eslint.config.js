const { fixupPluginRules } = require('@eslint/compat');
const { FlatCompat } = require('@eslint/eslintrc');
const nxReactPlugin = require('@nx/react');
const formatjsPlugin = require('eslint-plugin-formatjs');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const testingLibraryPlugin = require('eslint-plugin-testing-library');

const rootConfig = require('../../../eslint.config.js');

const compat = new FlatCompat();

module.exports = [
  ...rootConfig,
  {
    plugins: {
      '@nx/react': nxReactPlugin,
    },
  },
  {
    ignores: ['!**/*', 'node_modules/**/*'],
    plugins: {
      'react-hooks': fixupPluginRules(reactHooksPlugin),
      formatjs: fixupPluginRules(formatjsPlugin),
      'testing-library': testingLibraryPlugin,
      react: fixupPluginRules(reactPlugin),
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      'formatjs/no-offset': 'error',
      'react/jsx-curly-brace-presence': 'error',
    },
  },
  ...compat
    .config({
      extends: ['plugin:import/errors', 'plugin:import/warnings', 'plugin:import/typescript'],
    })
    .map((config) => ({
      ...config,
      ignores: ['!**/*', 'node_modules/**/*'],
      rules: {
        'import/order': ['error'],
      },
    })),
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'import/no-anonymous-default-export': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-empty': 'off',
      'react/jsx-no-useless-fragment': 'off',
    },
  },
  ...compat
    .config({
      extends: ['plugin:import/errors', 'plugin:import/warnings', 'plugin:import/typescript'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.stories.tsx'],
      rules: {
        'import/no-anonymous-default-export': 'off',
      },
    })),
  ...compat
    .config({
      extends: ['plugin:testing-library/react'],
    })
    .map((config) => ({
      ...config,
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      rules: {
        'testing-library/render-result-naming-convention': 'off',
        'testing-library/no-node-access': 'off',
      },
    })),
];
