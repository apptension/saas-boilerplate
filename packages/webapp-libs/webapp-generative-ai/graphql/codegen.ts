import { CodegenConfig } from '@graphql-codegen/cli';

const config: Partial<CodegenConfig> = {
  generates: {
    'src/graphql/__generated/gql/': {
      documents: ['../webapp-generative-ai/src/**/*.ts', '../webapp-generative-ai/src/**/*.tsx'],
      plugins: [],
    },
  },
};

export default config;
