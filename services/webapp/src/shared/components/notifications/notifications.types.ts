import { ExtractNodeType } from '../../utils/graphql';
import { notificationsListContent } from '../../../__generated__/notificationsListContent.graphql';
import { UnknownObject } from '../../utils/types';

export type NotificationType<T extends UnknownObject> = Omit<
  ExtractNodeType<notificationsListContent['allNotifications']>,
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
