import { gql } from '../../../services/graphqlApi/__generated/gql';

export const authSingupMutation = gql(/* GraphQL */ `
  mutation authSignupMutation($input: SingUpMutationInput!) {
    signUp(input: $input) {
      access
      refresh
    }
  }
`);
