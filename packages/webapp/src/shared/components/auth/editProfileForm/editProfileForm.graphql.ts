import { gql } from '@sb/webapp-api-client/graphql';

export const authUpdateUserProfileMutation = gql(/* GraphQL */ `
  mutation authUpdateUserProfileMutation($input: UpdateCurrentUserMutationInput!) {
    updateCurrentUser(input: $input) {
      userProfile {
        id
        user {
          ...commonQueryCurrentUserFragment
        }
      }
    }
  }
`);
