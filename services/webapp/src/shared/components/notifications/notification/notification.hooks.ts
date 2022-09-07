import { MouseEvent } from 'react';
import graphql from 'babel-plugin-relay/macro';
import { usePromiseMutation } from '../../../services/graphqlApi/usePromiseMutation';
import {
  notificationMutation,
  UpdateNotificationMutationInput,
} from './__generated__/notificationMutation.graphql';

export const useToggleIsRead = (input: UpdateNotificationMutationInput) => {
  const [commitNotificationMutation] = usePromiseMutation<notificationMutation>(graphql`
    mutation notificationMutation($input: UpdateNotificationMutationInput!) {
      updateNotification(input: $input) {
        hasUnreadNotifications
        notificationEdge {
          node {
            readAt
          }
        }
      }
    }
  `);

  return async (event: MouseEvent) => {
    event.stopPropagation();
    await commitNotificationMutation({
      variables: {
        input,
      },
      updater: (store) => {
        const value = store.getRootField('updateNotification').getValue('hasUnreadNotifications');
        store.getRoot().setValue(value, 'hasUnreadNotifications');
      },
    });
  };
};
