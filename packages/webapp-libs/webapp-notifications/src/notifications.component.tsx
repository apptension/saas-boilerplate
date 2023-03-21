import { NetworkStatus, useQuery } from '@apollo/client';
import { useOpenState } from '@sb/webapp-core/hooks';
import { ElementType, FC, useEffect } from 'react';
import ClickAwayListener from 'react-click-away-listener';

import { notificationsListQuery, notificationsListSubscription } from './notifications.graphql';
import { NotificationTypes } from './notifications.types';
import { NotificationsButton } from './notificationsButton';
import { NotificationsList } from './notificationsList';
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
      updateQuery: (prev, { subscriptionData }) => {
        const newEdges = subscriptionData.data?.notificationCreated?.edges ?? [];

        return {
          ...prev,
          allNotifications: {
            ...prev.allNotifications,
            edges: [...newEdges, ...prev.allNotifications.edges],
          },
          hasUnreadNotifications: true,
        };
      },
    });
  }, [subscribeToMore]);

  if (loading && networkStatus === NetworkStatus.loading) {
    return <NotificationsButton.Fallback />;
  }

  const onLoadMore = (cursor, count = NOTIFICATIONS_PER_PAGE) => {
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
