import { NetworkStatus } from '@apollo/client';
import { useQuery, useSubscription } from '@apollo/client/react';
import { getFragmentData } from '@sb/webapp-api-client';
import { Popover, PopoverContent, PopoverTrigger } from '@sb/webapp-core/components/ui/popover';
import { ElementType, FC } from 'react';

import { notificationCreatedSubscription, notificationsListQuery } from './notifications.graphql';
import { NotificationTypes } from './notifications.types';
import { NotificationsButton, NotificationsButtonFallback } from './notificationsButton';
import {
  NotificationsList,
  notificationsListContentFragment,
  notificationsListItemFragment,
} from './notificationsList';
import { NOTIFICATIONS_PER_PAGE } from './notificationsList/notificationsList.constants';

export type NotificationsProps = {
  templates: Record<NotificationTypes, ElementType>;
  events: Partial<Record<NotificationTypes, () => void | undefined>>;
};

export const Notifications: FC<NotificationsProps> = ({ templates, events }) => {
  const { loading, data, fetchMore, networkStatus } = useQuery(notificationsListQuery);
  useSubscription(notificationCreatedSubscription, {
    onData: (options) => {
      const notificationData = getFragmentData(
        notificationsListItemFragment,
        options.data?.data?.notificationCreated?.notification
      );

      if (notificationData) {
        events[notificationData.type as NotificationTypes]?.();

        const cache = options.client.cache;
        const notificationId = cache.identify({ __typename: 'NotificationType', id: notificationData.id });
        
        // Check if notification already exists in the connection
        const existingData = cache.readQuery({ query: notificationsListQuery });
        const existingListData = existingData
          ? getFragmentData(notificationsListContentFragment, existingData as any)
          : undefined;
        const alreadyExists = existingListData?.allNotifications?.edges?.some((edge) => {
          const nodeData = getFragmentData(notificationsListItemFragment, edge?.node);
          return nodeData?.id === notificationData.id;
        });

        if (!alreadyExists) {
          // Write the notification fragment to cache
          cache.writeFragment({
            data: notificationData,
            fragment: notificationsListItemFragment,
          });

          // Add to connection and update unread flag
          cache.modify({
            fields: {
              allNotifications(existingConnection) {
                return {
                  ...existingConnection,
                  edges: [{ node: { __ref: notificationId } }, ...(existingConnection?.edges ?? [])],
                };
              },
              hasUnreadNotifications() {
                return true;
              },
            },
          });
        }
      }
    },
  });

  if (loading && networkStatus === NetworkStatus.loading) {
    return <NotificationsButtonFallback />;
  }

  const onLoadMore = async (cursor: string, count = NOTIFICATIONS_PER_PAGE) => {
    await fetchMore({
      variables: {
        cursor,
        count,
      },
    });
  };

  return (
    <Popover>
      <PopoverTrigger data-testid="notifications-trigger-testid" asChild>
        <NotificationsButton queryResult={data} />
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" align="end" side="bottom" sideOffset={8}>
        <NotificationsList templates={templates} queryResult={data} loading={loading} onLoadMore={onLoadMore} />
      </PopoverContent>
    </Popover>
  );
};
