import { faker } from '@faker-js/faker';
import { NotificationTypes } from '../../shared/components/notifications/notifications.types';
import { NotificationType } from '../../shared/services/graphqlApi/__generated/types';
import { createFactory } from './factoryCreators';

export const notificationFactory = createFactory<NotificationType>(() => ({
  id: faker.datatype.uuid(),
  type: faker.helpers.arrayElement(Object.values(NotificationTypes)),
  data: {},
  createdAt: faker.date.past().toISOString(),
  readAt: null,
}));
