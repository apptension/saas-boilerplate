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
  }
`);

// export const notificationsListSubscription = gql(/* GraphQL */ `
//   subscription notificationsListSubscription {
//     notificationCreated {
//       edges {
//         node {
//           id
//           type
//           createdAt
//           readAt
//           data
//           issuer {
//             id
//             avatar
//             email
//           }
//         }
//       }
//     }
//   }
// `);
