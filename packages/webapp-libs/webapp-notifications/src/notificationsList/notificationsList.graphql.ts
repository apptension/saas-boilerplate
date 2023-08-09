import { gql } from '@sb/webapp-api-client/graphql';

export const notificationsListContentFragment = gql(/* GraphQL */ `
  fragment notificationsListContentFragment on Query {
    hasUnreadNotifications
    allNotifications(first: $count, after: $cursor) {
      edges {
        node {
          id
          data
          createdAt
          readAt
          type
          issuer {
            id
            avatar
            email
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`);

export const notificationsListMarkAsReadMutation = gql(/* GraphQL */ `
  mutation notificationsListMarkAsReadMutation($input: MarkReadAllNotificationsMutationInput!) {
    markReadAllNotifications(input: $input) {
      ok
    }
  }
`);
