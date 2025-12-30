import { TenantUserRole } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DocumentNode } from 'graphql';

import { membershipFactory, tenantFactory } from '../../../../tests/factories/tenant';
import { render } from '../../../../tests/utils/rendering';
import { MembershipEntry, MembershipEntryProps } from '../membershipEntry.component';
import {
  deleteTenantMembershipMutation,
  resendTenantInvitationMutation,
  updateTenantMembershipMutation,
} from '../membershipEntry.graphql';

const prepareMocks = <T extends DocumentNode>(query: T, input: Record<string, any> = {}) => {
  const mockedMembershipId = '1';
  const mockedTenantId = '2';
  const membership = membershipFactory({
    role: TenantUserRole.ADMIN,
    id: mockedMembershipId,
  });
  const user = currentUserFactory({
    roles: [TenantUserRole.ADMIN],
    tenants: [
      tenantFactory({
        name: 'name',
        id: mockedTenantId,
      }),
    ],
  });
  const commonQueryMock = fillCommonQueryWithUser(user);
  const data = {
    tenantMembership: {
      id: mockedMembershipId,
    },
  };
  const variables = {
    input: {
      id: mockedMembershipId,
      tenantId: mockedTenantId,
      ...input,
    },
  };
  const requestMock = composeMockedQueryResult(query, {
    variables,
    data,
  });

  const refetch = jest.fn();

  return {
    membership,
    commonQueryMock,
    requestMock,
    refetch,
  };
};

describe('MembershipEntry: Component', () => {
  const Component = (props: MembershipEntryProps) => <MembershipEntry {...props} />;

  it('should commit update mutation', async () => {
    const { membership, commonQueryMock, requestMock } = prepareMocks(updateTenantMembershipMutation, {
      role: TenantUserRole.MEMBER,
    });

    render(<Component membership={membership} />, {
      apolloMocks: [commonQueryMock, requestMock],
    });

    // Click the dropdown trigger button
    const triggerButton = await screen.findByRole('button');
    await userEvent.click(triggerButton);

    // Wait for and click the "Change role" submenu trigger
    const changeRoleBtn = await screen.findByRole('button', { name: /Change role/i });
    await userEvent.click(changeRoleBtn);

    // Wait for and click the "Member" role option
    const memberRoleBtn = await screen.findByRole('button', { name: /Member/i });
    await userEvent.click(memberRoleBtn);

    // Wait for the toast first (proves mutation completed), then verify mock was called
    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent('The user role was updated successfully!');
    expect(requestMock.result).toHaveBeenCalled();
  });

  it('should commit delete mutation', async () => {
    const { membership, commonQueryMock, requestMock, refetch } = prepareMocks(deleteTenantMembershipMutation);

    render(<Component membership={membership} onAfterUpdate={refetch} />, {
      apolloMocks: [commonQueryMock, requestMock],
    });

    // Click the dropdown trigger button
    const triggerButton = await screen.findByRole('button');
    await userEvent.click(triggerButton);

    // Wait for and click the "Delete" menu item
    const deleteMenuItem = await screen.findByText(/Delete/i);
    await userEvent.click(deleteMenuItem);

    // Wait for and click the "Continue" button in the confirm dialog
    const continueBtn = await screen.findByRole('button', { name: /Continue/i });
    await userEvent.click(continueBtn);

    // Wait for the toast first (proves mutation completed), then verify mocks were called
    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent('User was removed successfully!');
    expect(requestMock.result).toHaveBeenCalled();
    expect(refetch).toHaveBeenCalled();
  });

  it('should show resend button for pending invitations and commit resend mutation', async () => {
    const mockedMembershipId = '1';
    const mockedTenantId = '2';
    const membership = membershipFactory({
      role: TenantUserRole.MEMBER,
      id: mockedMembershipId,
      invitationAccepted: false,
      inviteeEmailAddress: 'test@example.com',
    });
    const user = currentUserFactory({
      roles: [TenantUserRole.OWNER],
      tenants: [
        tenantFactory({
          name: 'name',
          id: mockedTenantId,
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    const data = {
      resendTenantInvitation: {
        ok: true,
      },
    };
    const variables = {
      input: {
        id: mockedMembershipId,
        tenantId: mockedTenantId,
      },
    };
    const requestMock = composeMockedQueryResult(resendTenantInvitationMutation, {
      variables,
      data,
    });

    render(<Component membership={membership} />, {
      apolloMocks: [commonQueryMock, requestMock],
    });

    // Check that "No" is displayed and resend button is visible
    expect(await screen.findByText(/No/i)).toBeInTheDocument();

    // Click the resend button
    const resendButton = await screen.findByRole('button', { name: /Resend/i });
    await userEvent.click(resendButton);

    // Wait for the toast first (proves mutation completed), then verify mock was called
    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent('Invitation was resent successfully!');
    expect(requestMock.result).toHaveBeenCalled();
  });

  it('should not show resend button for accepted invitations', async () => {
    const { membership, commonQueryMock } = prepareMocks(updateTenantMembershipMutation);
    // The default membershipFactory has invitationAccepted: true

    render(<Component membership={membership} />, {
      apolloMocks: [commonQueryMock],
    });

    // Check that "Yes" is displayed (wait for it to appear)
    expect(await screen.findByText(/Yes/i)).toBeInTheDocument();

    // Resend button should not be present
    expect(screen.queryByRole('button', { name: /Resend/i })).not.toBeInTheDocument();
  });
});
