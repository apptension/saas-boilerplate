import { NotificationTypes } from '../../shared/components/notifications/notifications.types';
import { NotificationType } from '../../shared/services/graphqlApi/__generated/types';
import { makeId } from '../../tests/utils/fixtures';
import { createFactory } from './factoryCreators';

export const notificationFactory = createFactory<NotificationType>(() => ({
  id: makeId(32),
  type: NotificationTypes.CRUD_ITEM_CREATED,
  data: {},
  createdAt: new Date().toISOString(),
  readAt: null,
}));
