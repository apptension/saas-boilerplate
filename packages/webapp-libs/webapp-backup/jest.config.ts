export default {
  displayName: 'webapp-backup',
  preset: '../../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  transformIgnorePatterns: ['/node_modules/(?!(@iconify-icons|react-markdown)/)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/packages/webapp-libs/webapp-backup',
  setupFilesAfterEnv: ['./src/tests/setupTests.ts'],
};
