import { gql } from '../../../services/graphqlApi/__generated/gql';

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
