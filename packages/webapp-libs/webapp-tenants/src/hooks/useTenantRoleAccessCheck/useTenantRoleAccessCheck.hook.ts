import { TenantRole } from '../../modules/auth/tenantRole.types';
import { useCurrentTenant } from '../../providers';

export const useTenantRoleAccessCheck = (
  allowedRole: TenantRole | TenantRole[] = [TenantRole.OWNER, TenantRole.ADMIN, TenantRole.MEMBER]
) => {
  const { data: currentTenant } = useCurrentTenant();
  const userRole = currentTenant?.membership.role;
  const allowedRolesArray = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  return {
    isAllowed: allowedRolesArray.some((role) => role === userRole),
  };
};
