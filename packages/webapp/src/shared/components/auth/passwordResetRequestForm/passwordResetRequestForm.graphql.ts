import { gql } from '@sb/webapp-api-client/graphql';

export const authRequestPasswordResetMutation = gql(/* GraphQL */ `
  mutation authRequestPasswordResetMutation($input: PasswordResetMutationInput!) {
    passwordReset(input: $input) {
      ok
    }
  }
`);
