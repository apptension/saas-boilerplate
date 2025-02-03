import { NetworkStatus, useQuery, useSubscription } from '@apollo/client';
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

      if (notificationData) events[notificationData.type as NotificationTypes]?.();

      options.client.cache.updateQuery({ query: notificationsListQuery }, (prev) => {
        const prevListData = getFragmentData(notificationsListContentFragment, prev);
        const alreadyExists = prevListData?.allNotifications?.edges?.find((edge) => {
          const nodeData = getFragmentData(notificationsListItemFragment, edge?.node);
          return nodeData?.id === notificationData?.id;
        });
        if (alreadyExists) {
          return prev;
        }

        return {
          ...prev,
          allNotifications: {
            ...(prevListData?.allNotifications ?? {}),
            edges: [
              ...(notificationData ? [{ node: notificationData }] : []),
              ...(prevListData?.allNotifications?.edges ?? []),
            ],
          },
          hasUnreadNotifications: true,
        };
      });
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
      <PopoverContent className="md:w-96 w-72" align="end" side="bottom" sideOffset={15}>
        <NotificationsList templates={templates} queryResult={data} loading={loading} onLoadMore={onLoadMore} />
      </PopoverContent>
    </Popover>
  );
};
