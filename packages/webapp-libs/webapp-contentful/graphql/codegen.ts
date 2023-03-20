import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  generates: {
    'src/graphql/__generated/gql/': {
      schema: {
        '../webapp-contentful/graphql/schema/contentful.graphql': {
          loader: '../webapp-contentful/graphql/schema/loader.js',
        },
      },
      documents: ['../webapp-contentful/src/**/*.ts', '../webapp-contentful/src/**/*.tsx'],

      plugins: [],
    },
  },
};

export default config;
