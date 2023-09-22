import { NetworkStatus, useQuery } from '@apollo/client';
import { ResultOf } from '@graphql-typed-document-node/core';
import { Popover, PopoverContent, PopoverTrigger } from '@sb/webapp-core/components/popover';
import { ElementType, FC, useEffect } from 'react';

import { notificationsListQuery, notificationsListSubscription } from './notifications.graphql';
import { NotificationTypes } from './notifications.types';
import { NotificationsButton, NotificationsButtonFallback } from './notificationsButton';
import { NotificationsList, notificationsListContentFragment } from './notificationsList';
import { NOTIFICATIONS_PER_PAGE } from './notificationsList/notificationsList.constants';

type NotificationsProps = {
  templates: Record<NotificationTypes, ElementType>;
};

export const Notifications: FC<NotificationsProps> = ({ templates }) => {
  const { loading, data, fetchMore, networkStatus, subscribeToMore } = useQuery(notificationsListQuery);

  useEffect(() => {
    subscribeToMore({
      document: notificationsListSubscription,
      updateQuery: (
        prev: ResultOf<typeof notificationsListContentFragment>,
        { subscriptionData }
      ): ResultOf<typeof notificationsListContentFragment> => ({
        ...prev,
        allNotifications: {
          __typename: 'NotificationConnection',
          pageInfo: {
            __typename: 'PageInfo',
            endCursor: null,
            hasNextPage: false,
          },
          ...(prev?.allNotifications ?? {}),

          edges: [
            ...(subscriptionData.data?.notificationCreated?.edges ?? []),
            ...(prev.allNotifications?.edges ?? []),
          ],
        },
        hasUnreadNotifications: true,
      }),
    });
  }, [subscribeToMore]);

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
