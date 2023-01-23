const { getPlugin, pluginByName, throwUnexpectedConfigError } = require('@craco/craco');
const { merge } = require('webpack-merge');

module.exports = {
  babel: {
    plugins: ['relay'],
  },
  eslint: {
    mode: 'file',
  },
  webpack: {
    plugins: {
      remove: ['HtmlWebpackPlugin', 'InlineChunkHtmlPlugin', 'InterpolateHtmlPlugin'],
    },
    configure: (webpackConfig, { env, paths }) => {
      const forkTsCheckerWebpackPlugin = getPlugin(webpackConfig, pluginByName('ForkTsCheckerWebpackPlugin'));
      if (!forkTsCheckerWebpackPlugin.isFound) {
        throwUnexpectedConfigError({ message: 'Could not find ForkTsCheckerWebpackPlugin in the webpack config' });
      }
      forkTsCheckerWebpackPlugin.match.tsconfig = paths.appTsConfig.replace('tsconfig.json', 'tsconfig.app.json');

      return merge(webpackConfig, {
        target: 'node',
        entry: './src/emails/index.tsx',
        output: {
          filename: 'email-renderer/index.js',
          libraryTarget: 'umd',
        },
        optimization: {
          splitChunks: false,
          runtimeChunk: false,
        },
      });
    },
  },
};
