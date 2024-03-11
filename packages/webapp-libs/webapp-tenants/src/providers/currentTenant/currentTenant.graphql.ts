import { gql } from '@sb/webapp-api-client/graphql';

/**
 * @category graphql
 */
export const tenantListItemFragment = gql(/* GraphQL */ `
  fragment tenantListItemFragment on TenantType {
    id
    name
    type
    membership {
      role
      invitationAccepted
    }
  }
`);

/**
 * @category graphql
 */
export const tenantFragment = gql(/* GraphQL */ `
  fragment tenantFragment on TenantType {
    id
    name
    slug
    membership {
      role
      invitationAccepted
    }
  }
`);

/**
 * @category graphql
 */
export const currentTenantQuery = gql(/* GraphQL */ `
  query currentTenantQuery($id: ID!) {
    tenant(id: $id) {
      ...tenantFragment
    }
  }
`);
