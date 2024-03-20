import { gql } from '@sb/webapp-api-client/graphql';

export const tenantMembersListQuery = gql(/* GraphQL */ `
  query tenantMembersListQuery($id: ID!) {
    tenant(id: $id) {
      userMemberships {
        id
        role
        invitationAccepted
        userId
        username
        inviteeEmailAddress
      }
    }
  }
`);
