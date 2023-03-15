import { NotificationType } from '@sb/webapp-api-client';
import { composeMockedPaginatedListQueryResult } from '@sb/webapp-api-client/tests/utils';

import {
  notificationsListQuery,
  notificationsListSubscription,
} from '../../shared/components/notifications/notifications.graphql';

export const fillNotificationsListQuery = (
  notifications: Array<Partial<NotificationType>> = [],
  additionalData?: Record<string, any>
) => {
  return composeMockedPaginatedListQueryResult(
    notificationsListQuery,
    'allNotifications',
    'NotificationType',
    {
      data: notifications,
      variables: {
        count: 20,
      },
      additionalData,
    },
    { endCursor: 'test', hasNextPage: false }
  );
};

export const fillNotificationsSubscriptionQuery = (
  notifications: Array<Partial<NotificationType>> = [],
  additionalData?: Record<string, any>
) => {
  return composeMockedPaginatedListQueryResult(
    notificationsListSubscription,
    'notificationCreated',
    'NotificationType',
    {
      data: notifications,
      additionalData,
    },
    { endCursor: 'test', hasNextPage: false }
  );
};
