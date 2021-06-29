import { ElementType } from 'react';
import { getEnvNumber } from '../../utils/env';
import { NotificationTypes } from './notifications.types';
import { CrudItemCreated, CrudItemUpdated } from './notifications';

export const NOTIFICATIONS_STRATEGY: Record<NotificationTypes, ElementType> = {
  [NotificationTypes.CRUD_ITEM_CREATED]: CrudItemCreated,
  [NotificationTypes.CRUD_ITEM_UPDATED]: CrudItemUpdated,
  //<-- INJECT NOTIFICATION STRATEGY -->
};

export const POLLING_INTERVAL = getEnvNumber('REACT_APP_NOTIFICATIONS_POLLING_INTERVAL') ?? 5000;
