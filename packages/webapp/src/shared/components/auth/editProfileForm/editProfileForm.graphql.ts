import { gql } from '../../../services/graphqlApi/__generated/gql';

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
