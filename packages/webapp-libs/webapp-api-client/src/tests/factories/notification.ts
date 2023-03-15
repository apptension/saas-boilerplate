import { NotificationType } from '../../graphql';
import { createFactory, makeId } from '../utils';
import { currentUserFactory } from './auth';

export const notificationFactory = createFactory<NotificationType>(() => ({
  id: makeId(32),
  type: 'CRUD_ITEM_CREATED',
  data: {},
  createdAt: new Date().toISOString(),
  readAt: null,
  user: currentUserFactory(),
}));
