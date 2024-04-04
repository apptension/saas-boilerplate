import { TenantType as TenantTypeField } from '@sb/webapp-api-client/constants/tenant.types';
import { TenantMembershipType, TenantType } from '@sb/webapp-api-client/graphql';
import { createDeepFactory, makeId } from '@sb/webapp-api-client/tests/utils';

import { TenantRole } from '../../modules/auth/tenantRole.types';

export const membershipFactory = createDeepFactory<TenantMembershipType>(() => ({
  id: makeId(32),
  invitationAccepted: true,
  role: TenantRole.MEMBER,
  __typename: 'TenantMembershipType',
}));

export const tenantFactory = createDeepFactory<TenantType>(() => ({
  id: makeId(32),
  name: 'Tenant Name',
  membership: membershipFactory(),
  type: TenantTypeField.PERSONAL,
  __typename: 'TenantType',
}));
