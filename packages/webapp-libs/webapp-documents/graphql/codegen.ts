import { CodegenConfig } from '@graphql-codegen/cli';

const config: Partial<CodegenConfig> = {
  generates: {
    'src/graphql/__generated/gql/': {
      documents: ['../webapp-documents/src/**/*.ts', '../webapp-documents/src/**/*.tsx'],

      plugins: [],
    },
  },
};

export default config;
