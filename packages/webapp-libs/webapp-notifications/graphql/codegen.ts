import { CodegenConfig } from '@graphql-codegen/cli';

const config: Partial<CodegenConfig> = {
  generates: {
    'src/graphql/__generated/gql/': {
      documents: ['../webapp-notifications/src/**/*.ts', '../webapp-notifications/src/**/*.tsx'],

      plugins: [],
    },
  },
};

export default config;
