export default {
  displayName: 'webapp',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  transformIgnorePatterns: ['/node_modules/(?!(@iconify-icons|react-markdown)/)'],
  moduleNameMapper: {
    'react-markdown': '<rootDir>/node_modules/react-markdown/react-markdown.min.js',
    '^!!raw-loader!.*': 'jest-raw-loader',
    '\\.svg\\?react$': '<rootDir>/src/tests/svgMock.ts',
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
