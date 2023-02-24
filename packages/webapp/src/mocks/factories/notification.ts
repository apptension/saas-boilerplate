import {
  notificationsListQuery,
  notificationsListSubscription,
} from '../../shared/components/notifications/notifications.graphql';
import { NotificationTypes } from '../../shared/components/notifications/notifications.types';
import { NotificationType } from '../../shared/services/graphqlApi';
import { composeMockedPaginatedListQueryResult, makeId } from '../../tests/utils/fixtures';
import { currentUserFactory } from './auth';
import { createFactory } from './factoryCreators';

export const notificationFactory = createFactory<NotificationType>(() => ({
  id: makeId(32),
  type: NotificationTypes.CRUD_ITEM_CREATED,
  data: {},
  createdAt: new Date().toISOString(),
  readAt: null,
  user: currentUserFactory(),
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
