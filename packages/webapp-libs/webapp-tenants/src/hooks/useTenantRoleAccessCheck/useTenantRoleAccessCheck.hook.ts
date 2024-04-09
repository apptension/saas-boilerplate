import { MultitenancyTenantMembershipRoleChoices } from '@sb/webapp-api-client';

import { useCurrentTenant } from '../../providers';

export const useTenantRoleAccessCheck = (
  allowedRole: MultitenancyTenantMembershipRoleChoices | MultitenancyTenantMembershipRoleChoices[] = [
    MultitenancyTenantMembershipRoleChoices.OWNER,
    MultitenancyTenantMembershipRoleChoices.ADMIN,
    MultitenancyTenantMembershipRoleChoices.MEMBER,
  ]
) => {
  const { data: currentTenant } = useCurrentTenant();
  const userRole = currentTenant?.membership.role;
  const allowedRolesArray = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  return {
    isAllowed: allowedRolesArray.some((role) => role === userRole),
  };
};
