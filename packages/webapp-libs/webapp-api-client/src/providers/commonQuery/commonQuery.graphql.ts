import { gql } from '../../graphql';

/**
 * @category graphql
 */
export const commonQueryCurrentUserFragment = gql(/* GraphQL */ `
  fragment commonQueryCurrentUserFragment on CurrentUserType {
    id
    email
    firstName
    lastName
    roles
    avatar
    otpVerified
    otpEnabled
  }
`);

/**
 * @category graphql
 */
export const commonQueryCurrentUserQuery = gql(/* GraphQL */ `
  query commonQueryCurrentUserQuery {
    currentUser {
      ...commonQueryCurrentUserFragment
    }
  }
`);
