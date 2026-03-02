import { gql } from '@sb/webapp-api-client/graphql';

export const notificationsListQuery = gql(/* GraphQL */ `
  query notificationsListQuery($count: Int = 20, $cursor: String) {
    ...notificationsListContentFragment
    ...notificationsButtonContent
  }
  
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
  
  fragment notificationsButtonContent on Query {
    hasUnreadNotifications
    unreadNotificationsCount
  }
`);

export const notificationCreatedSubscription = gql(/* GraphQL */ `
  subscription NotificationCreatedSubscription {
    notificationCreated {
      notification {
        ...notificationsListItemFragment
      }
    }
  }
  
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
