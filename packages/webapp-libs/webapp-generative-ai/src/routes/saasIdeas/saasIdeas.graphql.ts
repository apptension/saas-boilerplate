import { gql } from '@sb/webapp-api-client/graphql';

export const generateSaasIdeasMutation = gql(/* GraphQL */ `
  mutation generateSaasIdeasMutation($input: GenerateSaasIdeasMutationInput!) {
    generateSaasIdeas(input: $input) {
      ideas
    }
  }
`);
