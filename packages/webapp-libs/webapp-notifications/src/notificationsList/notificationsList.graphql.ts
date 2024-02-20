import { gql } from '@sb/webapp-api-client/graphql';

export const notificationsListContentFragment = gql(/* GraphQL */ `
  fragment notificationsListContentFragment on Query {
    hasUnreadNotifications
    allNotifications(first: $count, after: $cursor) {
      edges {
        node {
          id
          ...notificationsListItemFragment
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`);

export const notificationsListItemFragment = gql(/* GraphQL */ `
  fragment notificationsListItemFragment on NotificationType {
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
`);

export const notificationsListMarkAsReadMutation = gql(/* GraphQL */ `
  mutation notificationsListMarkAsReadMutation($input: MarkReadAllNotificationsMutationInput!) {
    markReadAllNotifications(input: $input) {
      ok
    }
  }
`);
