const nxPreset = require('@nx/jest/preset').default;
const path = require('path');

module.exports = {
  ...nxPreset,
  /* TODO: Update to latest Jest snapshotFormat
   * By default Nx has kept the older style of Jest Snapshot formats
   * to prevent breaking of any existing tests with snapshots.
   * It's recommend you update to the latest format.
   * You can do this by removing snapshotFormat property
   * and running tests with --update-snapshot flag.
   * Example: "nx affected --targets=test --update-snapshot"
   * More info: https://jestjs.io/docs/upgrading-to-jest29#snapshot-format
   */
  snapshotFormat: { escapeString: true, printBasicPrototype: true },
  moduleNameMapper: {
    // Mock apollo-upload-client ESM module for Jest compatibility
    'apollo-upload-client/UploadHttpLink.mjs': path.join(
      __dirname,
      'packages/webapp-libs/webapp-api-client/src/tests/mocks/apolloUploadClient.ts'
    ),
    // Mock uuid ESM module for Jest compatibility (pnpm structure causes issues)
    // Use the CJS dist path for uuid to avoid ESM parsing issues
    '^uuid$': path.join(__dirname, 'node_modules/.pnpm/uuid@9.0.1/node_modules/uuid/dist/commonjs-browser/index.js'),
    // Mock Vite env helper for Jest (avoids import.meta.env parsing issues)
    '.*/env\\.vite$': path.join(
      __dirname,
      'packages/webapp-libs/webapp-core/src/tests/mocks/envVite.ts'
    ),
  },
};
