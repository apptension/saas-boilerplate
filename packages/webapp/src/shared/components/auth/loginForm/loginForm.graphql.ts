import { gql } from '../../../services/graphqlApi/__generated/gql';

export const authSinginMutation = gql(/* GraphQL */ `
  mutation loginFormMutation($input: ObtainTokenMutationInput!) {
    tokenAuth(input: $input) {
      access
      refresh
    }
  }
`);
