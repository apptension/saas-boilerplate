import * as faker from 'faker';
import { ExtractNodeType } from '../../shared/utils/graphql';
import { notificationsListContent } from '../../__generated__/notificationsListContent.graphql';
import { NotificationTypes } from '../../shared/components/notifications/notifications.types';
import { createFactory } from './factoryCreators';

export const notificationFactory = createFactory<ExtractNodeType<notificationsListContent['allNotifications']>>(() => ({
  id: faker.random.uuid(),
  type: faker.random.arrayElement(Object.values(NotificationTypes)),
  data: {},
  createdAt: faker.date.past().toISOString(),
  readAt: null,
}));
