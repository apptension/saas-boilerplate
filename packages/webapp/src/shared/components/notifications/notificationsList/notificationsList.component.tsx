import { ElementType, Suspense } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { isEmpty } from 'ramda';
import { ButtonVariant } from '../../forms/button';
import { NotificationSkeleton } from '../notification';
import { EmptyState } from '../../emptyState';
import { NotificationTypes } from '../notifications.types';
import { NOTIFICATIONS_STRATEGY } from '../notifications.constants';
import notificationsListQueryGraphql, {
  notificationsListQuery,
  notificationsListQuery$data,
} from '../__generated__/notificationsListQuery.graphql';
import { Container, List, MarkAllAsReadButton, Title } from './notificationsList.styles';
import { NOTIFICATIONS_PER_PAGE } from './notificationsList.constants';
import { useMarkAllAsRead, useNotificationsListContent } from './notificationsList.hooks';
import { NotificationErrorBoundary } from './notificationErrorBoundary';

export type NotificationsListProps = {
  isOpen: boolean;
  listQueryRef: PreloadedQuery<notificationsListQuery>;
};

export const NotificationsList = ({ listQueryRef, isOpen }: NotificationsListProps) => {
  const intl = useIntl();
  const queryResponse = usePreloadedQuery(notificationsListQueryGraphql, listQueryRef);

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
        <Suspense
          fallback={
            <>
              <NotificationSkeleton />
              <NotificationSkeleton />
            </>
          }
        >
          <Content queryResponse={queryResponse} />
        </Suspense>
      </List>
    </Container>
  );
};

type ContentProps = {
  queryResponse: notificationsListQuery$data;
};

const Content = ({ queryResponse }: ContentProps) => {
  const { allNotifications, loadNext, hasNext, isLoadingNext } = useNotificationsListContent(queryResponse);

  const [scrollSensorRef] = useInfiniteScroll({
    loading: isLoadingNext,
    hasNextPage: hasNext,
    onLoadMore: () => {
      loadNext(NOTIFICATIONS_PER_PAGE);
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
        if (!NotificationComponent) {
          return null;
        }
        return (
          <NotificationErrorBoundary key={notification.id}>
            <NotificationComponent {...notification} />
          </NotificationErrorBoundary>
        );
      })}
      {(hasNext || isLoadingNext) && (
        <>
          <NotificationSkeleton ref={scrollSensorRef} />
          <NotificationSkeleton />
        </>
      )}
    </>
  );
};
