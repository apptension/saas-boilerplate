import { NotificationType as NotificationTypeBase } from '@sb/webapp-api-client/graphql';
import { UnknownObject } from '@sb/webapp-core/utils/types';

export enum NotificationTypes {
  CRUD_ITEM_CREATED = 'CRUD_ITEM_CREATED',
  CRUD_ITEM_UPDATED = 'CRUD_ITEM_UPDATED',
  TENANT_INVITATION_CREATED = 'TENANT_INVITATION_CREATED',
  TENANT_INVITATION_ACCEPTED = 'TENANT_INVITATION_ACCEPTED',
  TENANT_INVITATION_DECLINED = 'TENANT_INVITATION_DECLINED',
  ACTION_LOG_EXPORT_READY = 'ACTION_LOG_EXPORT_READY',
  ACTION_LOG_EXPORT_FAILED = 'ACTION_LOG_EXPORT_FAILED',
  //<-- INJECT NOTIFICATION TYPE -->
}

export type NotificationType<T extends UnknownObject> = Omit<NotificationTypeBase, 'type' | 'data'> & {
  type: NotificationTypes;
  data: T;
};
