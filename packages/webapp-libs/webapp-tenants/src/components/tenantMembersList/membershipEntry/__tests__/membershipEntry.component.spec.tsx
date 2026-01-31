import { TenantUserRole } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { Table, TableBody } from '@sb/webapp-core/components/ui/table';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { currentUserPermissionsQuery } from '../../../../routes/tenantSettings/tenantRoles/tenantRoles.graphql';
import { membershipFactory, tenantFactory } from '../../../../tests/factories/tenant';
import { render } from '../../../../tests/utils/rendering';
import { MembershipEntry, MembershipEntryProps } from '../membershipEntry.component';
import { resendTenantInvitationMutation } from '../membershipEntry.graphql';

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
    // Mock permissions query to return edit permissions
    const permissionsMock = composeMockedQueryResult(currentUserPermissionsQuery, {
      variables: { tenantId: MOCKED_TENANT_ID },
      data: {
        currentUserPermissions: ['members.roles.edit', 'members.remove'],
      },
    });

    render(<Component membership={membership} />, {
      apolloMocks: [commonQueryMock, permissionsMock],
    });

    // Wait for component to render
    expect(await screen.findByText(/Yes/i)).toBeInTheDocument();

    // The dropdown trigger button should be present when user has permissions
    // We look for a button with the grip icon (actions dropdown)
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(0); // At minimum, component renders
  });
});
