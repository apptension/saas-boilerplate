import { NetworkStatus, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import ClickAwayListener from 'react-click-away-listener';

import { useOpenState } from '../../hooks';
import { notificationsListQuery, notificationsListSubscription } from './notifications.graphql';
import { NotificationsButton } from './notificationsButton';
import { NotificationsList } from './notificationsList';
import { NOTIFICATIONS_PER_PAGE } from './notificationsList/notificationsList.constants';

export const Notifications = () => {
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
