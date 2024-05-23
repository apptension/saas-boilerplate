import { fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import nxReactPlugin from '@nx/react';
import formatjsPlugin from 'eslint-plugin-formatjs';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import testingLibraryPlugin from 'eslint-plugin-testing-library';

import rootConfig from '../../../eslint.config.js';

const compat = new FlatCompat();

export default [
  ...rootConfig,
  {
    plugins: {
      '@nx/react': nxReactPlugin,
    },
  },
  {
    ignores: ['!**/*', 'node_modules/**/*'],
    plugins: {
      'react-hooks': reactHooksPlugin,
      formatjs: fixupPluginRules(formatjsPlugin),
      'testing-library': testingLibraryPlugin,
      react: reactPlugin,
    },
    rules: {
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
