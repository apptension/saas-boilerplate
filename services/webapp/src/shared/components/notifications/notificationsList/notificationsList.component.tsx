import React, { ElementType, Suspense } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { isEmpty } from 'ramda';
import { ButtonVariant } from '../../button';
import { NotificationSkeleton } from '../notification';
import NotificationsListQuery, {
  notificationsListQuery,
  notificationsListQueryResponse,
} from '../../../../__generated__/notificationsListQuery.graphql';
import { EmptyState } from '../../emptyState';
import { NotificationTypes } from '../notifications.types';
import { NOTIFICATIONS_STRATEGY } from '../notifications.constants';
import { Container, List, MarkAllAsReadButton, Title } from './notificationsList.styles';
import { NOTIFICATIONS_PER_PAGE } from './notificationsList.constants';
import { useMarkAllAsRead, useNotificationsListContent, useRefetchNotifications } from './notificationsList.hooks';

export type NotificationsListProps = {
  isOpen: boolean;
  listQueryRef: PreloadedQuery<notificationsListQuery>;
};

export const NotificationsList = ({ listQueryRef, isOpen }: NotificationsListProps) => {
  const intl = useIntl();
  const queryResponse = usePreloadedQuery(NotificationsListQuery, listQueryRef);

  const markAllAsRead = useMarkAllAsRead(
    intl.formatMessage({
      defaultMessage: 'All notifications marked as read.',
      description: 'Notifications / Notifications List / Mark all as read notification',
    })
  );

  return (
    <Container isOpen={isOpen}>
      <Title>
        <FormattedMessage defaultMessage="Notifications" description="Notifications / Notifications List / Title" />
      </Title>
      <MarkAllAsReadButton variant={ButtonVariant.RAW} onClick={markAllAsRead}>
        <FormattedMessage
          defaultMessage="Mark all as read"
          description="Notifications / Notifications List / Mark all as read button"
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
          <Content isOpen={isOpen} queryResponse={queryResponse} />
        </Suspense>
      </List>
    </Container>
  );
};

type ContentProps = Pick<NotificationsListProps, 'isOpen'> & {
  queryResponse: notificationsListQueryResponse;
};

const Content = ({ isOpen, queryResponse }: ContentProps) => {
  const { allNotifications, loadNext, hasNext, fetchNotifications, isLoadingNext } = useNotificationsListContent(
    queryResponse
  );

  const [scrollSensorRef] = useInfiniteScroll({
    loading: isLoadingNext,
    hasNextPage: hasNext,
    onLoadMore: () => {
      loadNext(NOTIFICATIONS_PER_PAGE);
    },
    disabled: false,
  });

  useRefetchNotifications({ fetchNotifications, isOpen });

  if (isEmpty(allNotifications)) {
    return (
      <EmptyState>
        <FormattedMessage
          defaultMessage="No notifications"
          description="Notifications / Notifications List / Empty state"
        />
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
        return <NotificationComponent key={notification.id} {...notification} />;
      })}
      {(hasNext || isLoadingNext) && (
        <>
          <NotificationSkeleton $ref={scrollSensorRef} />
          <NotificationSkeleton />
        </>
      )}
    </>
  );
};
