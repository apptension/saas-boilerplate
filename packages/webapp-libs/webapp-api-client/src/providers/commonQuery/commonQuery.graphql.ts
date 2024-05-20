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
export const commonQueryTenantItemFragment = gql(/* GraphQL */ `
  fragment commonQueryTenantItemFragment on TenantType {
    id
    name
    type
    membership {
      id
      role
      invitationAccepted
      invitationToken
    }
  }
`);

/**
 * @category graphql
 */
export const commonQueryCurrentUserQuery = gql(/* GraphQL */ `
  query commonQueryCurrentUserQuery {
    currentUser {
      ...commonQueryCurrentUserFragment
      tenants {
        ...commonQueryTenantItemFragment
      }
    }
  }
`);
