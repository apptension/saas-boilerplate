import { TenantUserRole } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { Table, TableBody } from '@sb/webapp-core/components/ui/table';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RoutesConfig } from '../../../../config/routes';
import {
  allOrganizationRolesQuery,
  assignRolesToMemberMutation,
  currentUserPermissionsQuery,
} from '../../../../routes/tenantSettings/tenantRoles/tenantRoles.graphql';
import { membershipFactory, tenantFactory } from '../../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { MembershipEntry, MembershipEntryProps } from '../membershipEntry.component';
import {
  deleteTenantMembershipMutation,
  resendTenantInvitationMutation,
} from '../membershipEntry.graphql';

jest.mock('@sb/webapp-tenants/hooks', () => ({
  ...jest.requireActual('@sb/webapp-tenants/hooks'),
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  usePermissionCheck: () => ({ hasPermission: true, loading: false }),
}));

const MOCKED_TENANT_ID = '2';
const MOCKED_MEMBERSHIP_ID = '1';

describe('MembershipEntry: Component', () => {
  const Component = (props: MembershipEntryProps) => (
    <Table>
      <TableBody>
        <MembershipEntry {...props} />
      </TableBody>
    </Table>
  );

  it('should render membership entry with accepted invitation', async () => {
    const membership = membershipFactory({
      role: TenantUserRole.ADMIN,
      id: MOCKED_MEMBERSHIP_ID,
      invitationAccepted: true,
    });
    const user = currentUserFactory({
      roles: [TenantUserRole.ADMIN],
      tenants: [
        tenantFactory({
          name: 'name',
          id: MOCKED_TENANT_ID,
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);

    render(<Component membership={membership} />, {
      apolloMocks: [commonQueryMock],
    });

    // Check that "Yes" is displayed for accepted invitation
    expect(await screen.findByText(/Yes/i)).toBeInTheDocument();

    // Resend button should not be present for accepted invitations
    expect(screen.queryByRole('button', { name: /Resend/i })).not.toBeInTheDocument();
  });

  it('should show resend button for pending invitations', async () => {
    const membership = membershipFactory({
      role: TenantUserRole.MEMBER,
      id: MOCKED_MEMBERSHIP_ID,
      invitationAccepted: false,
      inviteeEmailAddress: 'test@example.com',
    });
    const user = currentUserFactory({
      roles: [TenantUserRole.OWNER],
      tenants: [
        tenantFactory({
          name: 'name',
          id: MOCKED_TENANT_ID,
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);

    render(<Component membership={membership} />, {
      apolloMocks: [commonQueryMock],
    });

    // Check that "No" is displayed for pending invitation
    expect(await screen.findByText(/No/i)).toBeInTheDocument();

    // Resend button should be present for pending invitations
    expect(await screen.findByRole('button', { name: /Resend/i })).toBeInTheDocument();
  });

  it('should commit resend mutation for pending invitations', async () => {
    const membership = membershipFactory({
      role: TenantUserRole.MEMBER,
      id: MOCKED_MEMBERSHIP_ID,
      invitationAccepted: false,
      inviteeEmailAddress: 'test@example.com',
    });
    const user = currentUserFactory({
      roles: [TenantUserRole.OWNER],
      tenants: [
        tenantFactory({
          name: 'name',
          id: MOCKED_TENANT_ID,
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    const requestMock = composeMockedQueryResult(resendTenantInvitationMutation, {
      variables: {
        input: {
          id: MOCKED_MEMBERSHIP_ID,
          tenantId: MOCKED_TENANT_ID,
        },
      },
      data: {
        resendTenantInvitation: {
          ok: true,
        },
      },
    });

    render(<Component membership={membership} />, {
      apolloMocks: [commonQueryMock, requestMock],
    });

    // Click the resend button
    const resendButton = await screen.findByRole('button', { name: /Resend/i });
    await userEvent.click(resendButton);

    // Wait for the toast (proves mutation completed)
    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent('Invitation was resent successfully!');
    expect(requestMock.result).toHaveBeenCalled();
  });

  it('should show actions dropdown when user has permissions', async () => {
    const membership = membershipFactory({
      role: TenantUserRole.ADMIN,
      id: MOCKED_MEMBERSHIP_ID,
      invitationAccepted: true,
    });
    const currentUserMembership = membershipFactory({ id: 'current-user-membership', role: TenantUserRole.OWNER });
    const user = currentUserFactory({
      roles: [TenantUserRole.OWNER],
      tenants: [
        tenantFactory({
          name: 'name',
          id: MOCKED_TENANT_ID,
          membership: currentUserMembership,
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    const permissionsMock = composeMockedQueryResult(currentUserPermissionsQuery, {
      variables: { tenantId: MOCKED_TENANT_ID },
      data: {
        currentUserPermissions: ['members.roles.edit', 'members.remove'],
      },
    });

    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.members, { tenantId: MOCKED_TENANT_ID });

    render(<Component membership={membership} />, {
      apolloMocks: [commonQueryMock, permissionsMock],
      routerProps,
    });

    expect(await screen.findByText(/Yes/i)).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    const actionsButton = buttons.find((b) => !b.textContent?.includes('Resend'));
    expect(actionsButton).toBeDefined();
    await userEvent.click(actionsButton!);
    expect(await screen.findByText(/Manage roles/i)).toBeInTheDocument();
  });

  it('should display organization roles when present', async () => {
    const membership = membershipFactory({
      id: MOCKED_MEMBERSHIP_ID,
      invitationAccepted: true,
      organizationRoles: [
        { id: 'role-1', name: 'Admin Role', color: 'BLUE', isSystemRole: false, isOwnerRole: false },
        { id: 'role-2', name: 'Viewer', color: 'GREEN', isSystemRole: true, isOwnerRole: false },
      ],
    });
    const currentUserMembership = membershipFactory({ id: 'current-user-membership', role: TenantUserRole.OWNER });
    const user = currentUserFactory({
      tenants: [tenantFactory({ id: MOCKED_TENANT_ID, membership: currentUserMembership })],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    const rolesMock = composeMockedQueryResult(allOrganizationRolesQuery, {
      variables: { tenantId: MOCKED_TENANT_ID },
      data: {
        allOrganizationRoles: {
          edges: [
            { node: { id: 'role-1', name: 'Admin Role', description: null, color: 'BLUE', systemRoleType: null, isSystemRole: false, isOwnerRole: false, memberCount: 1, permissions: [] } },
            { node: { id: 'role-2', name: 'Viewer', description: null, color: 'GREEN', systemRoleType: null, isSystemRole: true, isOwnerRole: false, memberCount: 2, permissions: [] } },
          ],
        },
      },
    });

    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.members, { tenantId: MOCKED_TENANT_ID });

    render(<Component membership={membership} />, {
      apolloMocks: [commonQueryMock, rolesMock],
      routerProps,
    });

    expect(await screen.findByText('Admin Role')).toBeInTheDocument();
    expect(await screen.findByText('Viewer')).toBeInTheDocument();
  });

  it('should open manage roles dialog and commit assign roles mutation', async () => {
    const membership = membershipFactory({
      id: MOCKED_MEMBERSHIP_ID,
      invitationAccepted: true,
      userEmail: 'member@example.com',
      organizationRoles: [{ id: 'role-1', name: 'Admin Role', color: 'BLUE', isSystemRole: false, isOwnerRole: false }],
    });
    const currentUserMembership = membershipFactory({ id: 'current-user-membership', role: TenantUserRole.OWNER });
    const user = currentUserFactory({
      tenants: [tenantFactory({ id: MOCKED_TENANT_ID, membership: currentUserMembership })],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    const rolesMock = composeMockedQueryResult(allOrganizationRolesQuery, {
      variables: { tenantId: MOCKED_TENANT_ID },
      data: {
        allOrganizationRoles: {
          edges: [
            { node: { id: 'role-1', name: 'Admin Role', description: null, color: 'BLUE', systemRoleType: null, isSystemRole: false, isOwnerRole: false, memberCount: 1, permissions: [] } },
            { node: { id: 'role-2', name: 'Viewer', description: null, color: 'GREEN', systemRoleType: null, isSystemRole: true, isOwnerRole: false, memberCount: 0, permissions: [] } },
          ],
        },
      },
    });
    const assignMock = composeMockedQueryResult(assignRolesToMemberMutation, {
      variables: { membershipId: MOCKED_MEMBERSHIP_ID, tenantId: MOCKED_TENANT_ID, roleIds: ['role-1', 'role-2'] },
      data: { assignRolesToMember: { ok: true, membership: { id: MOCKED_MEMBERSHIP_ID, organizationRoles: [] } } },
    });

    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.members, { tenantId: MOCKED_TENANT_ID });

    render(<Component membership={membership} />, {
      apolloMocks: [commonQueryMock, rolesMock, assignMock],
      routerProps,
    });

    expect(await screen.findByText(/Yes/i)).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    const actionsButton = buttons.find((b) => !b.textContent?.includes('Resend'));
    await userEvent.click(actionsButton!);

    const manageRolesItem = await screen.findByRole('menuitem', { name: /manage roles/i });
    await userEvent.click(manageRolesItem);

    expect(await screen.findByText(/Manage Roles/i)).toBeInTheDocument();

    const viewerRole = await screen.findByText('Viewer');
    await userEvent.click(viewerRole);

    const saveButton = await screen.findByRole('button', { name: /Save Roles/i });
    await userEvent.click(saveButton);

    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent(/roles were updated successfully/i);
  });

  it('should commit delete mutation when delete is confirmed', async () => {
    const membership = membershipFactory({
      id: MOCKED_MEMBERSHIP_ID,
      invitationAccepted: true,
      userEmail: 'other@example.com',
    });
    const currentUserMembership = membershipFactory({ id: 'current-user-membership', role: TenantUserRole.OWNER });
    const user = currentUserFactory({
      tenants: [tenantFactory({ id: MOCKED_TENANT_ID, membership: currentUserMembership })],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    const deleteMock = composeMockedQueryResult(deleteTenantMembershipMutation, {
      variables: { input: { id: MOCKED_MEMBERSHIP_ID, tenantId: MOCKED_TENANT_ID } },
      data: { deleteTenantMembership: { deletedIds: [MOCKED_MEMBERSHIP_ID], clientMutationId: null } },
    });

    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.members, { tenantId: MOCKED_TENANT_ID });

    render(<Component membership={membership} />, {
      apolloMocks: [commonQueryMock, deleteMock],
      routerProps,
    });

    expect(await screen.findByText(/Yes/i)).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    const actionsButton = buttons.find((b) => !b.textContent?.includes('Resend'));
    await userEvent.click(actionsButton!);

    const deleteItem = await screen.findByRole('menuitem', { name: /delete/i });
    await userEvent.click(deleteItem);

    const continueButton = await screen.findByRole('button', { name: /continue/i });
    await userEvent.click(continueButton);

    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent(/removed successfully/i);
  });

  it('should display member name when firstName and lastName are present', async () => {
    const membership = membershipFactory({
      id: MOCKED_MEMBERSHIP_ID,
      invitationAccepted: true,
      firstName: 'John',
      lastName: 'Doe',
      userEmail: 'john@example.com',
    });
    const currentUserMembership = membershipFactory({ id: 'current-user-membership', role: TenantUserRole.OWNER });
    const user = currentUserFactory({
      tenants: [tenantFactory({ id: MOCKED_TENANT_ID, membership: currentUserMembership })],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);

    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.members, { tenantId: MOCKED_TENANT_ID });

    render(<Component membership={membership} />, {
      apolloMocks: [commonQueryMock],
      routerProps,
    });

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(await screen.findByText('john@example.com')).toBeInTheDocument();
  });
});
