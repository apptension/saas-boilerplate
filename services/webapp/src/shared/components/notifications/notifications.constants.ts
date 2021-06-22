import { ElementType } from 'react';
import { NotificationTypes } from './notifications.types';
import { CrudItemCreated, CrudItemUpdated } from './notifications';

export const NOTIFICATIONS_STRATEGY: Record<NotificationTypes, ElementType> = {
  [NotificationTypes.CRUD_ITEM_CREATED]: CrudItemCreated,
  [NotificationTypes.CRUD_ITEM_UPDATED]: CrudItemUpdated,
  //<-- INJECT NOTIFICATION STRATEGY -->
};

export const POLLING_INTERVAL = process.env['REACT_APP_NOTIFICATIONS_POLLING_INTERVAL'] ?? 5000;
