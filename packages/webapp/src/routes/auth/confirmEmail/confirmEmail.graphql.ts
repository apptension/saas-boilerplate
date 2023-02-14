import { gql } from '../../../shared/services/graphqlApi/__generated/gql';

export const authConfirmUserEmailMutation = gql(/* GraphQL */ `
  mutation authConfirmUserEmailMutation($input: ConfirmEmailMutationInput!) {
    confirm(input: $input) {
      ok
    }
  }
`);
