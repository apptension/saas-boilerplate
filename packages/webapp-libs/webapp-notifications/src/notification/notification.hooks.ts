import { useMutation } from '@apollo/client';
import { UpdateNotificationMutationInput } from '@sb/webapp-api-client/graphql';
import { MouseEvent } from 'react';

import { notificationMutation } from './notification.graphql';

export const useToggleIsRead = (input: UpdateNotificationMutationInput) => {
  const [commitNotificationMutation] = useMutation(notificationMutation);
  return async (event?: MouseEvent) => {
    event?.stopPropagation();
    await commitNotificationMutation({
      variables: {
        input,
      },
      update(cache, { data }) {
        if (data?.updateNotification?.notificationEdge?.node) {
          const notificationId = data.updateNotification.notificationEdge.node.id;
          const readAt = data.updateNotification.notificationEdge.node.readAt;

          // Update the specific notification
          cache.modify({
            id: cache.identify({ __typename: 'NotificationType', id: notificationId }),
            fields: {
              readAt() {
                return readAt;
              },
            },
          });
        }

        // Update the global unread count
        cache.modify({
          fields: {
            hasUnreadNotifications(currentValue = false) {
              return data?.updateNotification?.hasUnreadNotifications ?? currentValue;
            },
          },
        });
      },
    });
  };
};
