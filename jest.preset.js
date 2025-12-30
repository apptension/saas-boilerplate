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
  },
};
