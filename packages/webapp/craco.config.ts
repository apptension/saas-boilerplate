const { getPlugin, pluginByName, throwUnexpectedConfigError } = require('@craco/craco');

module.exports = {
  babel: {
    plugins: ['relay'],
  },
  eslint: {
    mode: 'file',
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      const { isFound, match } = getPlugin(webpackConfig, pluginByName('ForkTsCheckerWebpackPlugin'));
      if (!isFound) {
        throwUnexpectedConfigError({ message: 'Could not find ForkTsCheckerWebpackPlugin in the webpack config' });
      }

      match.tsconfig = paths.appTsConfig.replace('tsconfig.json', 'tsconfig.app.json');

      return webpackConfig;
    },
  },
};
