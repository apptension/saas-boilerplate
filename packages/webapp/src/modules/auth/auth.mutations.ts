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

graphql`
  mutation authChangePasswordMutation($input: ChangePasswordMutationInput!) {
    changePassword(input: $input) {
      access
      refresh
    }
  }
`;

graphql`
  mutation authConfirmUserEmailMutation($input: ConfirmEmailMutationInput!) {
    confirm(input: $input) {
      ok
    }
  }
`;

graphql`
  mutation authRequestPasswordResetMutation($input: PasswordResetMutationInput!) {
    passwordReset(input: $input) {
      ok
    }
  }
`;

graphql`
  mutation authRequestPasswordResetConfirmMutation($input: PasswordResetConfirmationMutationInput!) {
    passwordResetConfirm(input: $input) {
      ok
    }
  }
`;
