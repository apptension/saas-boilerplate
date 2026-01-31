export default {
  displayName: 'webapp-ai-assistant',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/packages/webapp-libs/webapp-ai-assistant',
  setupFilesAfterEnv: ['./src/tests/setupTests.ts'],
};
