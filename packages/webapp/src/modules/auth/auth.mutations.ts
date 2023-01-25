import { gql } from '../../shared/services/graphqlApi/__generated/gql';

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

export const authSingupMutation = gql(/* GraphQL */ `
  mutation authSignupMutation($input: SingUpMutationInput!) {
    signUp(input: $input) {
      access
      refresh
    }
  }
`);

export const authChangePasswordMutation = gql(/* GraphQL */ `
  mutation authChangePasswordMutation($input: ChangePasswordMutationInput!) {
    changePassword(input: $input) {
      access
      refresh
    }
  }
`);

export const authConfirmUserEmailMutation = gql(/* GraphQL */ `
  mutation authConfirmUserEmailMutation($input: ConfirmEmailMutationInput!) {
    confirm(input: $input) {
      ok
    }
  }
`);

export const authRequestPasswordResetMutation = gql(/* GraphQL */ `
  mutation authRequestPasswordResetMutation($input: PasswordResetMutationInput!) {
    passwordReset(input: $input) {
      ok
    }
  }
`);

export const authRequestPasswordResetConfirmMutation = gql(/* GraphQL */ `
  mutation authRequestPasswordResetConfirmMutation($input: PasswordResetConfirmationMutationInput!) {
    passwordResetConfirm(input: $input) {
      ok
    }
  }
`);
