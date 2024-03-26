import { CodegenConfig } from '@graphql-codegen/cli';

const config: Partial<CodegenConfig> = {
  generates: {
    'src/graphql/__generated/gql/': {
      documents: ['../webapp-tenants/src/**/*.ts', '../webapp-tenants/src/**/*.tsx'],

      plugins: [],
    },
  },
};

export default config;
