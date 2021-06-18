import React, { Suspense, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import graphql from 'babel-plugin-relay/macro';
import { PreloadedQuery, usePaginationFragment, usePreloadedQuery } from 'react-relay';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { ButtonVariant } from '../../button';
import { Notification, NotificationSkeleton } from '../notification';
import { mapConnection } from '../../../utils/graphql';
import NotificationsListQuery, {
  notificationsListQuery,
  notificationsListQueryResponse,
} from '../../../../__generated__/notificationsListQuery.graphql';
import { notificationsListContent$key } from '../../../../__generated__/notificationsListContent.graphql';
import { NotificationsListRefetch } from '../../../../__generated__/NotificationsListRefetch.graphql';
import { EmptyState } from '../../emptyState';
import { Container, List, MarkAllAsReadButton, Title } from './notificationsList.styles';
import { POLLING_INTERVAL } from './notificationsList.constants';

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
          <Content queryResponse={queryResponse} />
        </Suspense>
      </List>
    </Container>
  );
};

type ContentProps = {
  queryResponse: notificationsListQueryResponse;
};

const Content = ({ queryResponse }: ContentProps) => {
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
          pageInfo {
            startCursor
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
      loadNext(20);
    },
    disabled: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (notificationsCount !== 0) {
        refetch(
          {
            count: notificationsCount,
          },
          { fetchPolicy: 'store-and-network' }
        );
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [notificationsCount, refetch]);

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
      {mapConnection(
        () => (
          <Notification />
        ),
        allNotifications
      )}
      {(hasNext || isLoadingNext) && (
        <>
          <NotificationSkeleton $ref={scrollSensorRef} />
          <NotificationSkeleton />
        </>
      )}
    </>
  );
};
