import { NetworkStatus, useQuery } from '@apollo/client';
import { ResultOf } from '@graphql-typed-document-node/core';
import { useOpenState } from '@sb/webapp-core/hooks';
import { ElementType, FC, useEffect } from 'react';
import ClickAwayListener from 'react-click-away-listener';

import { notificationsListQuery, notificationsListSubscription } from './notifications.graphql';
import { NotificationTypes } from './notifications.types';
import { NotificationsButton } from './notificationsButton';
import { NotificationsList, notificationsListContentFragment } from './notificationsList';
import { NOTIFICATIONS_PER_PAGE } from './notificationsList/notificationsList.constants';

type NotificationsProps = {
  templates: Record<NotificationTypes, ElementType>;
};

export const Notifications: FC<NotificationsProps> = ({ templates }) => {
  const notifications = useOpenState(false);

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
    return <NotificationsButton.Fallback />;
  }

  const onLoadMore = (cursor: string, count = NOTIFICATIONS_PER_PAGE) => {
    fetchMore({
      variables: {
        cursor,
        count,
      },
    });
  };

  return (
    <>
      <NotificationsButton queryResult={data} onClick={notifications.toggle} />
      <ClickAwayListener onClickAway={notifications.clickAway}>
        <>
          <NotificationsList
            templates={templates}
            isOpen={notifications.isOpen}
            queryResult={data}
            loading={loading}
            onLoadMore={onLoadMore}
          />
        </>
      </ClickAwayListener>
    </>
  );
};
