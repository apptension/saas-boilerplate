import { TenantUserRole } from '@sb/webapp-api-client';

import { useCurrentTenant } from '../../providers';

export const useTenantRoleAccessCheck = (
  allowedRole: TenantUserRole | TenantUserRole[] = [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER]
) => {
  const { data: currentTenant } = useCurrentTenant();
  const userRole = currentTenant?.membership.role;
  const allowedRolesArray = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  return {
    isAllowed: allowedRolesArray.some((role) => role === userRole),
  };
};
