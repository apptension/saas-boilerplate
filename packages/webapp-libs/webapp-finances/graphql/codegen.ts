import { CodegenConfig } from '@graphql-codegen/cli';

const config: Partial<CodegenConfig> = {
  generates: {
    'src/graphql/__generated/gql/': {
      documents: ['../webapp-finances/src/**/*.ts', '../webapp-finances/src/**/*.tsx'],

      plugins: [],
    },
  },
};

export default config;
