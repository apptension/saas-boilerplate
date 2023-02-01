import { gql } from '../../../services/graphqlApi/__generated/gql';

export const authChangePasswordMutation = gql(/* GraphQL */ `
  mutation authChangePasswordMutation($input: ChangePasswordMutationInput!) {
    changePassword(input: $input) {
      access
      refresh
    }
  }
`);
