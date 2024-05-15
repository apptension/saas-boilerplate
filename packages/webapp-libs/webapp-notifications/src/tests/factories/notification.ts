import { NotificationType } from '@sb/webapp-api-client';
import {
  composeMockedPaginatedListQueryResult,
  composeMockedQueryResult,
  createFactory,
  makeId,
} from '@sb/webapp-api-client/tests/utils';

import { notificationCreatedSubscription, notificationsListQuery } from '../../notifications.graphql';

export const notificationFactory = createFactory<NotificationType>(() => ({
  id: makeId(32),
  type: 'CRUD_ITEM_CREATED',
  data: {},
  createdAt: new Date().toISOString(),
  readAt: null,
  issuer: {
    id: makeId(32),
    email: 'mock@example.org',
    avatar: 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/315.jpg',
  },
}));

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
    { endCursor: 'test', hasNextPage: false, hasPreviousPage: false, startCursor: 'test' }
  );
};

export const fillNotificationCreatedSubscriptionQuery = (notification: NotificationType) => {
  return composeMockedQueryResult(notificationCreatedSubscription, {
    data: { notificationCreated: { notification } },
  });
};
