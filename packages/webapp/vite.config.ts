import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  // expose .env as process.env instead of import.meta since jest does not import meta yet
  const envWithProcessPrefix = Object.entries(env).reduce((prev, [key, val]) => {
    return {
      ...prev,
      ['process.env.' + key]: `"${val}"`,
    };
  }, {});

  return {
    cacheDir: '../../node_modules/.vite/webapp',

    server: {
      port: 3000,
      host: 'localhost',
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        '/static/graphene_django': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },

    preview: {
      port: 4300,
      host: 'localhost',
    },

    define: envWithProcessPrefix,

    plugins: [
      legacy(),
      react(),
      viteTsConfigPaths({
        root: '../../',
      }),
      svgrPlugin(),
      viteCommonjs(),
    ],

    build: {
      outDir: 'build',
    },

    resolve: {
      alias: {
        fs: require.resolve('rollup-plugin-node-builtins'),
        path: require.resolve('rollup-plugin-node-builtins'),
      },
    },
  };
});
