const { composePlugins, withNx, withWeb } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');

const moveRuleToFront = (config, loaderPattern) => {
  const { rule, index } = config.module.rules
    .map((rule, index) => ({ rule, index }))
    .find(({ rule }) => rule.use && rule.use.some((entry) => entry.loader.includes(loaderPattern)));
  config.module.rules.splice(index, 1);
  config.module.rules.unshift(rule);
};

// This `composePlugins` approach is not needed right now, but I guess it will be needed in Nx 16
// Then it will be important that `withReact()` comes before `withWeb()`
module.exports = composePlugins(withNx(), withReact(), withWeb(), (config) => {
  moveRuleToFront(config, '@svgr');
  return config;
});
