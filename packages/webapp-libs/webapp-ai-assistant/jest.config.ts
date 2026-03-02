export default {
  displayName: 'webapp-ai-assistant',
  preset: '../../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  transformIgnorePatterns: ['/node_modules/(?!(@iconify-icons|react-markdown)/)'],
  moduleNameMapper: {
    'react-markdown': '<rootDir>/../webapp-core/src/tests/mocks/reactMarkdown.tsx',
    'remark-gfm': '<rootDir>/../webapp-core/src/tests/mocks/remarkGfm.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/packages/webapp-libs/webapp-ai-assistant',
  setupFilesAfterEnv: ['./src/tests/setupTests.ts'],
};
