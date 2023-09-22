import { resolve } from 'path';

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import react from '@vitejs/plugin-react';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import polyfillNode from 'rollup-plugin-polyfill-node';
import { UserConfig, defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig(async (props): Promise<UserConfig> => {
  const env = loadEnv(props.mode, process.cwd());

  // expose .env as process.env instead of import.meta since jest does not import meta yet
  const envWithProcessPrefix = Object.entries(env).reduce((prev, [key, val]) => {
    return {
      ...prev,
      ['process.env.' + key]: `"${val}"`,
    };
  }, {});

  return {
    cacheDir: '../../node_modules/.vite/emails',

    define: envWithProcessPrefix,

    plugins: [
      react(),
      viteTsConfigPaths({
        projects: ['../../../tsconfig.base.json'],
      }),
      svgr(),
      viteCommonjs(),
      peerDepsExternal(),
    ],

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
        entry: resolve(__dirname, 'src/index.tsx'),
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
  };
});
