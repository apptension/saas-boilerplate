import { gql } from '@sb/webapp-api-client/graphql';

export const dashboardStatsQuery = gql(/* GraphQL */ `
  query dashboardStatsQuery($tenantId: ID!) {
    allCrudDemoItems(tenantId: $tenantId, first: 100) {
      edges {
        node {
          id
          name
          createdBy {
            id
          }
        }
      }
    }
    allDocumentDemoItems(first: 100) {
      edges {
        node {
          id
          createdAt
        }
      }
    }
    allNotifications(first: 100) {
      edges {
        node {
          id
          type
          createdAt
          readAt
        }
      }
    }
    tenant(id: $tenantId) {
      userMemberships {
        id
        role
        invitationAccepted
      }
    }
  }
`);
