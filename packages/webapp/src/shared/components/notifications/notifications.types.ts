import { UnknownObject } from '@saas-boilerplate-app/webapp-core/utils/types';

import { NotificationType as NotificationTypeBase } from '../../services/graphqlApi';

export type NotificationType<T extends UnknownObject> = Omit<NotificationTypeBase, 'type' | 'data'> & {
  type: NotificationTypes;
  data: T;
};

export enum NotificationTypes {
  CRUD_ITEM_CREATED = 'CRUD_ITEM_CREATED',
  CRUD_ITEM_UPDATED = 'CRUD_ITEM_UPDATED',
  //<-- INJECT NOTIFICATION TYPE -->
}
