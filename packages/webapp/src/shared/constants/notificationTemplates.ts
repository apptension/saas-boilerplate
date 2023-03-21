import { CrudItemCreated, CrudItemUpdated } from '@sb/webapp-crud-demo/notifications';
import { NotificationTypes } from '@sb/webapp-notifications';
import { ElementType } from 'react';

const templates: Record<NotificationTypes, ElementType> = {
  [NotificationTypes.CRUD_ITEM_CREATED]: CrudItemCreated,
  [NotificationTypes.CRUD_ITEM_UPDATED]: CrudItemUpdated,
};
export default templates;
