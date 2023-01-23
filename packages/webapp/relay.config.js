module.exports = {
  src: './src',
  schema: './graphql/schema/schema.graphql',
  language: 'typescript',
  customScalars: {
    DateTime: 'String',
  },
  exclude: ['**/node_modules/**', '**/__mocks__/**', '**/__generated__/**'],
};
