import { gql } from '@sb/webapp-api-client/graphql';

export const notificationMutation = gql(/* GraphQL */ `
  mutation notificationMutation($input: UpdateNotificationMutationInput!) {
    updateNotification(input: $input) {
      hasUnreadNotifications
      notificationEdge {
        node {
          id
          readAt
        }
      }
    }
  }
`);
