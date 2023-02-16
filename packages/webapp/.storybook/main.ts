import type { StorybookViteConfig } from '@storybook/builder-vite';

const { mergeConfig } = require('vite');

const config: StorybookViteConfig = {
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-essentials', 'storybook-dark-mode'],
  staticDirs: ['../public'],
  core: {
    builder: '@storybook/builder-vite',
  },
  async viteFinal(config, options) {
    const defaultViteConfig = (await import('../vite.config')).default({});
    // filter out deprecated plugins
    config.plugins = config.plugins
      .flat()
      .filter((p) => !['vite:react-jsx', 'vite:react-refresh', 'vite:react-babel'].includes(p.name));
    return mergeConfig(config, {
      plugins: defaultViteConfig.plugins,
      resolve: defaultViteConfig.resolve,
      define: {
        ...defaultViteConfig.define,
        jest: {},
        global: {},
      },
    });
  },
};

export default config;
