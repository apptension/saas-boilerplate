import { gql } from '@sb/webapp-api-client/graphql';

export const notificationsListQuery = gql(/* GraphQL */ `
  query notificationsListQuery($count: Int = 20, $cursor: String) {
    ...notificationsListContentFragment
    ...notificationsButtonContent
  }
`);

export const notificationsListSubscription = gql(/* GraphQL */ `
  subscription notificationsListSubscription {
    notificationCreated {
      edges {
        node {
          id
          type
          createdAt
          readAt
          data
          issuer {
            id
            avatar
            email
          }
        }
      }
    }
  }
`);
