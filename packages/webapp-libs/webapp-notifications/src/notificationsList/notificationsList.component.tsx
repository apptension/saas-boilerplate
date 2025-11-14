import { FragmentType, getFragmentData } from '@sb/webapp-api-client/graphql';
import { Button, ButtonVariant } from '@sb/webapp-core/components/buttons';
import { EmptyState } from '@sb/webapp-core/components/emptyState';
import { H4 } from '@sb/webapp-core/components/typography';
import { Separator } from '@sb/webapp-core/components/ui/separator';
import { Skeleton } from '@sb/webapp-core/components/ui/skeleton';
import { CheckCheck } from 'lucide-react';
import { isEmpty } from 'ramda';
import { ElementType } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { FormattedMessage, useIntl } from 'react-intl';

import { NotificationTypes } from '../notifications.types';
import { NotificationErrorBoundary } from './notificationErrorBoundary';
import { NOTIFICATIONS_PER_PAGE } from './notificationsList.constants';
import { notificationsListContentFragment, notificationsListItemFragment } from './notificationsList.graphql';
import { useMarkAllAsRead, useNotificationsListContent } from './notificationsList.hooks';

export type NotificationsListProps = {
  templates: Record<NotificationTypes, ElementType>;
  queryResult?: FragmentType<typeof notificationsListContentFragment>;
  loading: boolean;
  onLoadMore: (cursor: string, count: number) => void;
};

export const NotificationsList = (props: NotificationsListProps) => {
  const intl = useIntl();

  const markAllAsRead = useMarkAllAsRead(
    intl.formatMessage({
      defaultMessage: 'All notifications marked as read.',
      id: 'Notifications / Notifications List / Mark all as read notification',
    })
  );

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <H4 className="text-base font-semibold">
          <FormattedMessage defaultMessage="Notifications" id="Notifications / Notifications List / Title" />
        </H4>
        <Button
          icon={<CheckCheck size={14} />}
          className="h-8 text-xs"
          variant={ButtonVariant.GHOST}
          onClick={markAllAsRead}
        >
          <FormattedMessage
            defaultMessage="Mark all as read"
            id="Notifications / Notifications List / Mark all as read button"
          />
        </Button>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {props.loading ? (
          <div className="flex flex-col gap-0 p-2">
            <Skeleton className="h-20 rounded-none" data-testid="Skeleton" />
            <Skeleton className="h-20 rounded-none" data-testid="Skeleton" />
            <Skeleton className="h-20 rounded-none" data-testid="Skeleton" />
          </div>
        ) : (
          <Content {...props} />
        )}
      </div>
    </div>
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
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <EmptyState>
          <FormattedMessage defaultMessage="No notifications" id="Notifications / Notifications List / Empty state" />
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {allNotifications.map((notification) => {
        const notificationData = getFragmentData(notificationsListItemFragment, notification);
        const NotificationComponent = templates[notificationData.type as NotificationTypes] as ElementType | undefined;
        if (!notificationData || !NotificationComponent) {
          return null;
        }
        return (
          <NotificationErrorBoundary key={notification.id}>
            <NotificationComponent {...notificationData} />
          </NotificationErrorBoundary>
        );
      })}
      {(hasNext || loading) && (
        <div ref={scrollSensorRef} className="flex flex-col gap-2 p-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      )}
    </div>
  );
};
