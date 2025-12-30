import path from 'path';
import { mergeConfig } from 'vite';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.tsx',
    '../../webapp-libs/**/src/**/*.stories.tsx',
  ],
  addons: ['@storybook/addon-essentials', '@storybook/addon-themes', 'storybook-dark-mode'],
  staticDirs: ['../public'],
  core: {},
  async viteFinal(config, options) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          // Resolve stitches.config imports from radix-ui stories to dummy file
          '../../../../stitches.config': path.resolve(__dirname, './stitches.config.ts').replace(/\\/g, '/'),
        },
        // Deduplicate graphql to ensure single instance - prevents multiple copies being bundled
        dedupe: ['graphql', '@apollo/client', 'react', 'react-dom'],
      },
      optimizeDeps: {
        include: [
          'graphql',
          '@apollo/client',
        ],
      },
      build: {
        rollupOptions: {
          plugins: [
            {
              name: 'ignore-radix-stories',
              resolveId(id) {
                // Ignore radix-ui stories that reference stitches.config
                if (id.includes('@radix-ui') && id.includes('.stories.')) {
                  return { id: 'virtual:empty', external: true };
                }
                return null;
              },
            },
          ],
        },
      },
    });
  },
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: './vite.config.mts',
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
