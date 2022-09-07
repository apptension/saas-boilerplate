import graphql from 'babel-plugin-relay/macro';

graphql`
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
`;

graphql`
  mutation authSignupMutation($input: SingUpMutationInput!) {
    signUp(input: $input) {
      access
      refresh
    }
  }
`;
