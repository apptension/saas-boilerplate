import webappCoreConfig from '@sb/webapp-core/eslint.config.mjs';

import rootConfig from '../../eslint.config.js';

export default [
  ...rootConfig,
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
