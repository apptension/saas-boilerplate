import { useMutation } from '@apollo/client';
import { UpdateNotificationMutationInput } from '@sb/webapp-api-client/graphql';
import { MouseEvent } from 'react';

import { notificationMutation } from './notification.graphql';

export const useToggleIsRead = (input: UpdateNotificationMutationInput) => {
  const [commitNotificationMutation] = useMutation(notificationMutation);
  return async (event: MouseEvent) => {
    event.stopPropagation();
    await commitNotificationMutation({
      variables: {
        input,
      },
      update(cache, { data }) {
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
