import { gql } from '@sb/webapp-api-client/graphql';

export const authConfirmUserEmailMutation = gql(/* GraphQL */ `
  mutation authConfirmUserEmailMutation($input: ConfirmEmailMutationInput!) {
    confirm(input: $input) {
      ok
    }
  }
`);
