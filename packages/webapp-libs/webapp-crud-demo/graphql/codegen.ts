import { CodegenConfig } from '@graphql-codegen/cli';

const config: Partial<CodegenConfig> = {
  generates: {
    'src/graphql/__generated/gql/': {
      documents: ['../webapp-crud-demo/src/**/*.ts', '../webapp-crud-demo/src/**/*.tsx'],

      plugins: [],
    },
  },
};

export default config;
