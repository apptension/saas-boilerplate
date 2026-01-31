export default {
  displayName: 'webapp',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  transformIgnorePatterns: ['/node_modules/(?!(@iconify-icons|react-markdown)/)'],
  moduleNameMapper: {
    'react-markdown': '<rootDir>/src/tests/mocks/reactMarkdown.tsx',
    'remark-gfm': '<rootDir>/src/tests/mocks/remarkGfm.ts',
    '^!!raw-loader!.*': 'jest-raw-loader',
    '\\.svg\\?react$': '<rootDir>/src/tests/svgMock.ts',
    'apollo-upload-client/UploadHttpLink.mjs': '<rootDir>/src/tests/mocks/apolloUploadClient.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageReporters: ['lcov'],
  coveragePathIgnorePatterns: ['/node_modules/', '.*.svg'],
  setupFilesAfterEnv: ['./src/setupTests.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
