import { Role } from '../../api/auth';
import { CurrentUserType } from '../../graphql';
import { createFactory, makeId } from '../utils';

export const currentUserFactory = createFactory<CurrentUserType>(() => ({
  id: makeId(32),
  firstName: 'testFirstName',
  lastName: 'testLastName',
  email: 'mock@example.org',
  roles: [Role.ADMIN, Role.USER],
  avatar: 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/315.jpg',
  otpEnabled: false,
  otpVerified: false,
  tenants: [
    {
      id: makeId(32),
      name: 'Tenant Name',
      type: 'default',
      __typename: 'TenantType',
      membership: {
        id: makeId(32),
        invitationAccepted: true,
        role: 'owner',
        __typename: 'TenantMembershipType',
      },
    },
  ],
}));
