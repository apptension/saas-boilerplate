import { ExtractNodeType } from '../../utils/graphql';
import { UnknownObject } from '../../utils/types';
import { notificationsListContent$data } from './notificationsList/__generated__/notificationsListContent.graphql';

export type NotificationType<T extends UnknownObject> = Omit<
  ExtractNodeType<notificationsListContent$data['allNotifications']>,
  'type' | 'data'
> & {
  type: NotificationTypes;
  data: T;
};

export enum NotificationTypes {
  CRUD_ITEM_CREATED = 'CRUD_ITEM_CREATED',
  CRUD_ITEM_UPDATED = 'CRUD_ITEM_UPDATED',
  //<-- INJECT NOTIFICATION TYPE -->
}
