import { ElementType } from 'react';
import { NotificationTypes } from './notifications.types';
import {
  CrudItemCreated,
  CrudItemUpdated,
  //<-- INJECT NOTIFICATION COMPONENT IMPORT -->
} from './templates';

export const NOTIFICATIONS_STRATEGY: Record<NotificationTypes, ElementType> = {
  [NotificationTypes.CRUD_ITEM_CREATED]: CrudItemCreated,
  [NotificationTypes.CRUD_ITEM_UPDATED]: CrudItemUpdated,
  //<-- INJECT NOTIFICATION STRATEGY -->
};
