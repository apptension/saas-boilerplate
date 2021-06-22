import React, { ElementType, Suspense, useCallback, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import graphql from 'babel-plugin-relay/macro';
import { PreloadedQuery, usePaginationFragment, usePreloadedQuery } from 'react-relay';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { ButtonVariant } from '../../button';
import { NotificationSkeleton } from '../notification';
import { mapConnection } from '../../../utils/graphql';
import NotificationsListQuery, {
  notificationsListQuery,
  notificationsListQueryResponse,
} from '../../../../__generated__/notificationsListQuery.graphql';
import { notificationsListContent$key } from '../../../../__generated__/notificationsListContent.graphql';
import { NotificationsListRefetch } from '../../../../__generated__/NotificationsListRefetch.graphql';
import { EmptyState } from '../../emptyState';
import { NotificationTypes } from '../notifications.types';
import { NOTIFICATIONS_STRATEGY, POLLING_INTERVAL } from '../notifications.constants';
import { Container, List, MarkAllAsReadButton, Title } from './notificationsList.styles';
import { NOTIFICATIONS_PER_PAGE } from './notificationsList.constants';

export type NotificationsListProps = {
  isOpen: boolean;
  listQueryRef: PreloadedQuery<notificationsListQuery>;
};

export const NotificationsList = ({ listQueryRef, isOpen }: NotificationsListProps) => {
  const queryResponse = usePreloadedQuery(NotificationsListQuery, listQueryRef);

  return (
    <Container isOpen={isOpen}>
      <Title>
        <FormattedMessage defaultMessage="Notifications" description="Notifications / Notifications List / Title" />
      </Title>
      <MarkAllAsReadButton variant={ButtonVariant.RAW}>
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
  const {
    data: { allNotifications },
    refetch,
    loadNext,
    hasNext,
    isLoadingNext,
  } = usePaginationFragment<NotificationsListRefetch, notificationsListContent$key>(
    graphql`
      fragment notificationsListContent on ApiQuery
      @refetchable(queryName: "NotificationsListRefetch")
      @argumentDefinitions(count: { type: "Int", defaultValue: 20 }, cursor: { type: "String" }) {
        hasUnreadNotifications
        allNotifications(first: $count, after: $cursor) @connection(key: "notificationsList_allNotifications") {
          edges {
            node {
              id
              data
              createdAt
              readAt
              type
            }
          }
        }
      }
    `,
    queryResponse
  );

  const notificationsCount = allNotifications?.edges?.length ?? 0;

  const [scrollSensorRef] = useInfiniteScroll({
    loading: isLoadingNext,
    hasNextPage: hasNext,
    onLoadMore: () => {
      loadNext(NOTIFICATIONS_PER_PAGE);
    },
    disabled: false,
  });

  const fetchNotifications = useCallback(() => {
    refetch(
      {
        count: notificationsCount === 0 ? NOTIFICATIONS_PER_PAGE : notificationsCount,
      },
      { fetchPolicy: 'store-and-network' }
    );
  }, [notificationsCount, refetch]);

  useEffect(() => {
    let interval: number | null;
    if (isOpen) {
      interval = setInterval(() => {
        fetchNotifications();
      }, POLLING_INTERVAL);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchNotifications, isOpen, refetch]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  if (notificationsCount === 0) {
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
      {mapConnection((notification) => {
        const NotificationComponent = NOTIFICATIONS_STRATEGY[notification.type as NotificationTypes] as
          | ElementType
          | undefined;
        if (!NotificationComponent) {
          return null;
        }
        return <NotificationComponent key={notification.id} {...notification} />;
      }, allNotifications)}
      {(hasNext || isLoadingNext) && (
        <>
          <NotificationSkeleton $ref={scrollSensorRef} />
          <NotificationSkeleton />
        </>
      )}
    </>
  );
};
