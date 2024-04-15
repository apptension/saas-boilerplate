import { MultitenancyTenantMembershipRoleChoices } from '@sb/webapp-api-client';

import { useCurrentTenantRole } from '../useCurrentTenantRole';

export const useTenantRoleAccessCheck = (
  allowedRole: MultitenancyTenantMembershipRoleChoices | MultitenancyTenantMembershipRoleChoices[] = [
    MultitenancyTenantMembershipRoleChoices.OWNER,
    MultitenancyTenantMembershipRoleChoices.ADMIN,
    MultitenancyTenantMembershipRoleChoices.MEMBER,
  ]
) => {
  const userRole = useCurrentTenantRole();
  const allowedRolesArray = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  return {
    isAllowed: allowedRolesArray.some((role) => role === userRole),
  };
};
