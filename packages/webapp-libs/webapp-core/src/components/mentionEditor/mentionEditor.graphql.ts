import { gql } from '@sb/webapp-api-client/graphql';

export const tenantMembersForMentionsQuery = gql(/* GraphQL */ `
  query TenantMembersForMentions($tenantId: ID!) {
    tenant(id: $tenantId) {
      userMemberships {
        userId
        firstName
        lastName
        userEmail
        avatar
        invitationAccepted
      }
    }
  }
`);
