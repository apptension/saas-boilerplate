import { gql } from '../../../services/graphqlApi/__generated/gql';

export const authRequestPasswordResetMutation = gql(/* GraphQL */ `
  mutation authRequestPasswordResetMutation($input: PasswordResetMutationInput!) {
    passwordReset(input: $input) {
      ok
    }
  }
`);
