import { resolve } from 'path';

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import polyfillNode from 'rollup-plugin-polyfill-node';
import { defineConfig, mergeConfig } from 'vite';

import webappConfigFactory from './vite.config';

export default defineConfig(async (props) => {
  const webappConfig = webappConfigFactory(props);
  const sourceConfig = {
    define: webappConfig.define,
    plugins: webappConfig.plugins
      .flat()
      .filter(
        (p) =>
          !['vite:legacy-config', 'vite:legacy-generate-polyfill-chunk', 'vite:legacy-post-process'].includes(p.name)
      ),
  };
  return mergeConfig(sourceConfig, {
    cacheDir: '../../node_modules/.vite/emails',

    define: {
      global: '({})',
    },

    resolve: {
      alias: {
        util: 'rollup-plugin-node-polyfills/polyfills/util',
        events: 'rollup-plugin-node-polyfills/polyfills/events',
        stream: 'rollup-plugin-node-polyfills/polyfills/stream',
        path: 'rollup-plugin-node-polyfills/polyfills/path',
        zlib: 'rollup-plugin-node-polyfills/polyfills/zlib',
      },
    },

    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis',
        },
        // Enable esbuild polyfill plugins
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true,
          }),
          NodeModulesPolyfillPlugin(),
        ],
      },
    },

    build: {
      lib: {
        name: 'renderEmail',
        entry: resolve(__dirname, 'src/emails/index.tsx'),
        fileName: 'index',
        formats: ['umd'],
      },
      outDir: 'build/email-renderer',
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        plugins: [
          // Enable rollup polyfills plugin
          // used during production bundling
          polyfillNode(),
        ],
      },
    },
  });
});
