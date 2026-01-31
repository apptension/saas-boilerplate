import { TenantUserRole } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedListQueryResult, composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { tenantMembersListQuery } from '../../../../../components/tenantMembersList/tenantMembersList.graphql';
import { allOrganizationRolesQuery } from '../../../tenantRoles/tenantRoles.graphql';
import { tenantFactory } from '../../../../../tests/factories/tenant';
import { render } from '../../../../../tests/utils/rendering';
import { createTenantInvitation } from '../invitationForm.graphql';
import { InvitationForm } from '../invitationForm.component';

jest.mock('@sb/webapp-core/services/analytics');

const mockRoles = [
  {
    id: 'role-1',
    name: 'Member',
    description: 'Basic member role',
    color: 'BLUE',
    isSystemRole: true,
    isOwnerRole: false,
    memberCount: 5,
    permissions: [],
  },
  {
    id: 'role-2',
    name: 'Admin',
    description: 'Admin role',
    color: 'GREEN',
    isSystemRole: true,
    isOwnerRole: false,
    memberCount: 2,
    permissions: [],
  },
];

const createRolesMock = (tenantId: string) => {
  return composeMockedListQueryResult(allOrganizationRolesQuery, 'allOrganizationRoles', 'OrganizationRoleType', {
    variables: { tenantId },
    data: mockRoles,
  });
};

describe('InvitationForm: Component', () => {
  const Component = () => <InvitationForm />;

  it('should display empty form', async () => {
    const tenants = [tenantFactory({ membership: { role: TenantUserRole.MEMBER } })];
    const currentUser = currentUserFactory({ tenants });
    const rolesMock = createRolesMock(tenants[0].id);

    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: [fillCommonQueryWithUser(currentUser), rolesMock],
    });
    await waitForApolloMocks();

    const emailInput = await screen.findByLabelText(/email/i);
    expect(emailInput).toHaveValue('');

    // Roles dropdown should be present
    expect(await screen.findByText(/Select roles/i)).toBeInTheDocument();
  });

  describe('action completes successfully', () => {
    it('should commit mutation', async () => {
      const tenants = [tenantFactory({ membership: { role: TenantUserRole.MEMBER } })];
      const currentUser = currentUserFactory({ tenants });
      const tenantId = tenants[0].id;

      const emailValue = 'example@example.com';
      const roleIds = ['role-1'];

      const rolesMock = createRolesMock(tenantId);

      const variables = {
        input: {
          email: emailValue,
          organizationRoleIds: roleIds,
          tenantId,
        },
      };

      const data = {
        createTenantInvitation: {
          ok: true,
        },
      };
      const requestMock = composeMockedQueryResult(createTenantInvitation, {
        variables,
        data,
      });

      const refetchData = {
        tenant: {
          userMemberships: [],
        },
      };

      const refetchMock = composeMockedQueryResult(tenantMembersListQuery, {
        data: refetchData,
        variables: {
          id: tenantId,
        },
      });

      const apolloMocks = [fillCommonQueryWithUser(currentUser), rolesMock, requestMock, refetchMock];

      const { waitForApolloMocks } = render(<Component />, { apolloMocks });

      await waitForApolloMocks(0);

      // Type email
      await userEvent.type(await screen.findByLabelText(/email/i), emailValue);

      // Wait for roles to load and open dropdown
      const rolesButton = await screen.findByText(/Select roles/i);
      await userEvent.click(rolesButton);

      // Select a role
      const memberRole = await screen.findByText('Member');
      await userEvent.click(memberRole);

      // Submit the form
      await userEvent.click(screen.getByRole('button', { name: /invite/i }));

      // Wait for the toast (proves mutation completed)
      const toast = await screen.findByTestId('toast-1');
      expect(toast).toHaveTextContent('User invited successfully!');

      expect(requestMock.result).toHaveBeenCalled();
      expect(trackEvent).toHaveBeenCalledWith('tenantInvitation', 'invite', tenantId);
    });
  });
});
