import { asyncComponent } from '@sb/webapp-core/utils/asyncComponent';

export const AddTenantForm = asyncComponent(() => import('./addTenantForm'));
export const TenantSettings = asyncComponent(() => import('./tenantSettings'));
export const TenantMembers = asyncComponent(() => import('./tenantSettings/tenantMembers'));
export const TenantGeneralSettings = asyncComponent(() => import('./tenantSettings/tenantGeneralSettings'));
export const TenantInvitation = asyncComponent(() => import('./tenantInvitation'));
