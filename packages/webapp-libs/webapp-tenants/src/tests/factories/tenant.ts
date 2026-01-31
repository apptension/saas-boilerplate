import { TenantType as TenantTypeField } from '@sb/webapp-api-client/constants/tenant.types';
import { TenantMembershipType, TenantType, TenantUserRole } from '@sb/webapp-api-client/graphql';
import { composeMockedQueryResult, createDeepFactory, makeId } from '@sb/webapp-api-client/tests/utils';

import { currentUserPermissionsQuery } from '../../routes/tenantSettings/tenantRoles/tenantRoles.graphql';

export const membershipFactory = createDeepFactory<TenantMembershipType>(() => ({
  id: makeId(32),
  invitationAccepted: true,
  invitationToken: makeId(32),
  role: TenantUserRole.MEMBER,
  __typename: 'TenantMembershipType',
}));

export const tenantFactory = createDeepFactory<TenantType>(() => ({
  id: makeId(32),
  name: 'Tenant Name',
  membership: membershipFactory(),
  type: TenantTypeField.PERSONAL,
  __typename: 'TenantType',
}));

/**
 * Creates a mock for the currentUserPermissionsQuery
 * @param tenantId - The tenant ID to mock permissions for
 * @param permissions - Array of permission codes to return
 */
export const createPermissionsMock = (tenantId: string, permissions: string[] = []) => {
  return composeMockedQueryResult(currentUserPermissionsQuery, {
    variables: { tenantId },
    data: {
      currentUserPermissions: permissions,
    },
  });
};

/**
 * Default admin permissions for testing
 */
export const ADMIN_PERMISSIONS = [
  'org.settings.view',
  'org.settings.edit',
  'members.view',
  'members.invite',
  'members.roles.edit',
  'members.remove',
  'security.view',
  'security.sso.manage',
  'security.passkeys.manage',
  'billing.view',
  'billing.manage',
];

/**
 * Default owner permissions (all permissions)
 */
export const OWNER_PERMISSIONS = [
  ...ADMIN_PERMISSIONS,
  'org.delete',
  'org.roles.view',
  'org.roles.manage',
];
