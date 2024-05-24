const rootConfig = require('../../../eslint.config.js');

const webappCoreConfig = require('@sb/webapp-core/eslint.config.js');

module.exports = [...rootConfig, ...webappCoreConfig];
