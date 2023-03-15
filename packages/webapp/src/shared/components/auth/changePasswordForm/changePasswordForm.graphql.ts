import { gql } from '@sb/webapp-api-client/graphql';

export const authChangePasswordMutation = gql(/* GraphQL */ `
  mutation authChangePasswordMutation($input: ChangePasswordMutationInput!) {
    changePassword(input: $input) {
      access
      refresh
    }
  }
`);
