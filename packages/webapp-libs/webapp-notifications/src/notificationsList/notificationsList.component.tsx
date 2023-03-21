import { FragmentType } from '@sb/webapp-api-client/graphql';
import { ButtonVariant } from '@sb/webapp-core/components/buttons';
import { EmptyState } from '@sb/webapp-core/components/emptyState';
import { isEmpty } from 'ramda';
import { ElementType } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { FormattedMessage, useIntl } from 'react-intl';

import { NotificationSkeleton } from '../notification';
import { NotificationTypes } from '../notifications.types';
import { NotificationErrorBoundary } from './notificationErrorBoundary';
import { NOTIFICATIONS_PER_PAGE } from './notificationsList.constants';
import { notificationsListContentFragment } from './notificationsList.graphql';
import { useMarkAllAsRead, useNotificationsListContent } from './notificationsList.hooks';
import { Container, List, MarkAllAsReadButton, Title } from './notificationsList.styles';

export type NotificationsListProps = {
  templates: Record<NotificationTypes, ElementType>;
  isOpen: boolean;
  queryResult?: FragmentType<typeof notificationsListContentFragment>;
  loading: boolean;
  onLoadMore: (cursor: string, count: number) => void;
};

export const NotificationsList = ({ isOpen, ...props }: NotificationsListProps) => {
  const intl = useIntl();

  const markAllAsRead = useMarkAllAsRead(
    intl.formatMessage({
      defaultMessage: 'All notifications marked as read.',
      id: 'Notifications / Notifications List / Mark all as read notification',
    })
  );

  return (
    <Container isOpen={isOpen}>
      <Title>
        <FormattedMessage defaultMessage="Notifications" id="Notifications / Notifications List / Title" />
      </Title>
      <MarkAllAsReadButton variant={ButtonVariant.RAW} onClick={markAllAsRead}>
        <FormattedMessage
          defaultMessage="Mark all as read"
          id="Notifications / Notifications List / Mark all as read button"
        />
      </MarkAllAsReadButton>
      <List>
        {props.loading ? (
          <>
            <NotificationSkeleton />
            <NotificationSkeleton />
          </>
        ) : (
          <Content {...props} />
        )}
      </List>
    </Container>
  );
};

type ContentProps = Pick<NotificationsListProps, 'templates' | 'queryResult' | 'loading' | 'onLoadMore'>;

const Content = ({ templates, queryResult, loading, onLoadMore }: ContentProps) => {
  const { allNotifications, hasNext, endCursor } = useNotificationsListContent(queryResult);

  const [scrollSensorRef] = useInfiniteScroll({
    loading,
    hasNextPage: hasNext,
    onLoadMore: () => {
      if (hasNext && endCursor) {
        onLoadMore(endCursor, NOTIFICATIONS_PER_PAGE);
      }
    },
    disabled: false,
  });

  if (isEmpty(allNotifications)) {
    return (
      <EmptyState>
        <FormattedMessage defaultMessage="No notifications" id="Notifications / Notifications List / Empty state" />
      </EmptyState>
    );
  }

  return (
    <>
      {allNotifications.map((notification) => {
        const NotificationComponent = templates[notification.type as NotificationTypes] as ElementType | undefined;
        if (!notification.data || !NotificationComponent) {
          return null;
        }
        return (
          <NotificationErrorBoundary key={notification.id}>
            <NotificationComponent {...notification} />
          </NotificationErrorBoundary>
        );
      })}
      {(hasNext || loading) && (
        <>
          <NotificationSkeleton ref={scrollSensorRef} />
          <NotificationSkeleton />
        </>
      )}
    </>
  );
};
