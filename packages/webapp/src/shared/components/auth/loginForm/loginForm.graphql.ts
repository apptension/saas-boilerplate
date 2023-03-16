import { gql } from '@sb/webapp-api-client/graphql';

export const authSinginMutation = gql(/* GraphQL */ `
  mutation loginFormMutation($input: ObtainTokenMutationInput!) {
    tokenAuth(input: $input) {
      access
      refresh
      otpAuthToken
    }
  }
`);
