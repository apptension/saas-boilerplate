import { gql } from '@sb/webapp-api-client/graphql';

export const notificationsListQuery = gql(/* GraphQL */ `
  query notificationsListQuery($count: Int = 20, $cursor: String) {
    ...notificationsListContentFragment
    ...notificationsButtonContent
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
`);
