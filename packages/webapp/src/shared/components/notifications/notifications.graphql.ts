import { gql } from '../../services/graphqlApi/__generated/gql';

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
        }
      }
    }
  }
`);
