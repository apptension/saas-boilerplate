import { Suspense, useEffect } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { useQueryLoader } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { useOpenState } from '../../hooks/useOpenState';
import { notificationsListQuery } from './__generated__/notificationsListQuery.graphql';
import { NotificationsButton } from './notificationsButton';
import { NotificationsList } from './notificationsList';

export const Notifications = () => {
  const notifications = useOpenState(false);

  const [listQueryRef, loadListQuery] = useQueryLoader<notificationsListQuery>(
    graphql`
      query notificationsListQuery {
        ...notificationsListContent
        ...notificationsButtonContent
      }
    `
  );

  useEffect(() => {
    loadListQuery({});
  }, [loadListQuery]);

  if (!listQueryRef) return null;

  return (
    <Suspense fallback={<NotificationsButton.Fallback />}>
      <NotificationsButton listQueryRef={listQueryRef} onClick={notifications.toggle} />
      <ClickAwayListener onClickAway={notifications.clickAway}>
        <NotificationsList isOpen={notifications.isOpen} listQueryRef={listQueryRef} />
      </ClickAwayListener>
    </Suspense>
  );
};
