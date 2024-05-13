import { CrudItemCreated, CrudItemUpdated } from '@sb/webapp-crud-demo/notifications';
import { NotificationTypes } from '@sb/webapp-notifications';
import {
  TenantInvitationAccepted,
  TenantInvitationCreated,
  TenantInvitationDeclined,
} from '@sb/webapp-tenants/notifications';
import { ElementType } from 'react';

const templates: Record<NotificationTypes, ElementType> = {
  [NotificationTypes.CRUD_ITEM_CREATED]: CrudItemCreated,
  [NotificationTypes.CRUD_ITEM_UPDATED]: CrudItemUpdated,
  [NotificationTypes.TENANT_INVITATION_CREATED]: TenantInvitationCreated,
  [NotificationTypes.TENANT_INVITATION_ACCEPTED]: TenantInvitationAccepted,
  [NotificationTypes.TENANT_INVITATION_DECLINED]: TenantInvitationDeclined,
};
export default templates;
