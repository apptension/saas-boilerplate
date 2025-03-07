import { TenantType as TenantTypeField } from '@sb/webapp-api-client/constants/tenant.types';
import { TenantMembershipType, TenantType, TenantUserRole } from '@sb/webapp-api-client/graphql';
import { createDeepFactory, makeId } from '@sb/webapp-api-client/tests/utils';

export const membershipFactory = createDeepFactory<TenantMembershipType>(() => ({
  id: makeId(32),
  userId: makeId(32),
  invitationAccepted: true,
  inviteeEmailAddress: null,
  invitationToken: makeId(32),
  role: TenantUserRole.MEMBER,
  firstName: 'First Name',
  lastName: 'Last Name',
  userEmail: 'example@test.test',
  avatar: null,
  __typename: 'TenantMembershipType',
}));

export const tenantFactory = createDeepFactory<TenantType>(() => ({
  id: makeId(32),
  name: 'Tenant Name',
  membership: membershipFactory(),
  type: TenantTypeField.PERSONAL,
  __typename: 'TenantType',
}));
