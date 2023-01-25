import { ElementType } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { isEmpty } from 'ramda';
import { ButtonVariant } from '../../forms/button';
import { NotificationSkeleton } from '../notification';
import { EmptyState } from '../../emptyState';
import { NotificationTypes } from '../notifications.types';
import { NOTIFICATIONS_STRATEGY } from '../notifications.constants';
import { FragmentType } from '../../../services/graphqlApi/__generated/gql';
import { NOTIFICATIONS_PER_PAGE } from './notificationsList.constants';
import { Container, List, MarkAllAsReadButton, Title } from './notificationsList.styles';
import { useMarkAllAsRead, useNotificationsListContent } from './notificationsList.hooks';
import { NotificationErrorBoundary } from './notificationErrorBoundary';
import { notificationsListContentFragment } from './notificationsList.graphql';

export type NotificationsListProps = {
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

type ContentProps = Pick<NotificationsListProps, 'queryResult' | 'loading' | 'onLoadMore'>;

const Content = ({ queryResult, loading, onLoadMore }: ContentProps) => {
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
        const NotificationComponent = NOTIFICATIONS_STRATEGY[notification.type as NotificationTypes] as
          | ElementType
          | undefined;
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
