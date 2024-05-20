import { TenantUserRole } from '@sb/webapp-api-client';

import { useCurrentTenantRole } from '../useCurrentTenantRole';

export const useTenantRoleAccessCheck = (
  allowedRole: TenantUserRole | TenantUserRole[] = [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER]
) => {
  const userRole = useCurrentTenantRole();
  const allowedRolesArray = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  return {
    isAllowed: allowedRolesArray.some((role) => role === userRole),
  };
};
