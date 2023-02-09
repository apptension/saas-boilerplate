import { gql } from '../../../services/graphqlApi/__generated/gql';

export const authRequestPasswordResetConfirmMutation = gql(/* GraphQL */ `
  mutation authRequestPasswordResetConfirmMutation($input: PasswordResetConfirmationMutationInput!) {
    passwordResetConfirm(input: $input) {
      ok
    }
  }
`);
