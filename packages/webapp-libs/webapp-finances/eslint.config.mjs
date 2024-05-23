import webappCoreConfig from '@sb/webapp-core/eslint.config.mjs';

import rootConfig from '../../../eslint.config.js';

export default [...rootConfig, ...webappCoreConfig];
