import { useMutation } from '@apollo/client';
import { FragmentType, NotificationConnection, getFragmentData } from '@sb/webapp-api-client/graphql';
import { useMappedConnection } from '@sb/webapp-core/hooks';
import { useToast } from '@sb/webapp-core/toast/useToast';

import { notificationsListContentFragment, notificationsListMarkAsReadMutation } from './notificationsList.graphql';

export const useMarkAllAsRead = (message: string) => {
  const { toast } = useToast();

  const [commitMarkAsReadMutation] = useMutation(notificationsListMarkAsReadMutation);

  return async () => {
    await commitMarkAsReadMutation({
      variables: {
        input: {},
      },
      update(cache, { data }) {
        cache.modify({
          fields: {
            hasUnreadNotifications() {
              return false;
            },
            allNotifications(connection) {
              const readAt = new Date().toISOString();
              (connection as NotificationConnection)?.edges?.forEach((edge) => {
                cache.modify({
                  // @ts-ignore
                  id: edge?.node?.__ref,
                  fields: {
                    readAt() {
                      return readAt;
                    },
                  },
                });
              });
              return connection;
            },
          },
        });
      },
    });
    toast({ description: message });
  };
};

export const useNotificationsListContent = (queryResult?: FragmentType<typeof notificationsListContentFragment>) => {
  const data = getFragmentData(notificationsListContentFragment, queryResult);

  const allNotifications = useMappedConnection(data?.allNotifications);

  return {
    allNotifications,
    hasNext: data?.allNotifications?.pageInfo.hasNextPage || false,
    endCursor: data?.allNotifications?.pageInfo.endCursor,
  };
};
