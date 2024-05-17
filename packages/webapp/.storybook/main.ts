import type { StorybookConfig } from '@storybook/react-vite';

const { mergeConfig } = require('vite');
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx', '../../webapp-libs/**/src/**/*.stories.tsx'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-themes', 'storybook-dark-mode'],
  staticDirs: ['../public'],
  core: {},
  async viteFinal(config, options) {
    return mergeConfig(config, {});
  },
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: './vite.config.ts',
      },
    },
  },
  docs: {
    autodocs: true,
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};
export default config;
