import path from 'path';
import { fileURLToPath } from 'url';
import { mergeConfig } from 'vite';
import type { StorybookConfig } from '@storybook/react-vite';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.tsx',
    // Exclude node_modules to prevent duplicate stories from workspace dependencies
    '../../webapp-libs/*/src/**/*.stories.tsx',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes'],
  staticDirs: ['../public'],
  core: {},
  async viteFinal(config, options) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          // Resolve stitches.config imports from radix-ui stories to dummy file
          '../../../../stitches.config': path.resolve(__dirname, './stitches.config.ts').replace(/\\/g, '/'),
          // Map old @storybook/addon-actions to stub that re-exports from storybook in v10
          '@storybook/addon-actions': path.resolve(__dirname, './stubs/addon-actions.ts'),
          // Stub out MSW imports that @vitest/mocker tries to use (requires MSW 2.x but we have 1.x)
          'msw/browser': path.resolve(__dirname, './stubs/msw-browser.ts'),
          'msw/core/http': path.resolve(__dirname, './stubs/msw-core-http.ts'),
        },
        // Deduplicate graphql to ensure single instance - prevents multiple copies being bundled
        dedupe: ['graphql', '@apollo/client', 'react', 'react-dom'],
      },
      optimizeDeps: {
        include: [
          'graphql',
          '@apollo/client',
        ],
        // Exclude MSW and vitest mocker from optimization
        exclude: ['msw', '@vitest/mocker'],
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
