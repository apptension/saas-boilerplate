import { gql } from '../../../services/graphqlApi/__generated/gql';

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
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`);
