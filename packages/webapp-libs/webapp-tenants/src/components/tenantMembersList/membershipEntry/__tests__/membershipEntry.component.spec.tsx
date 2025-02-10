import { TenantUserRole } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DocumentNode } from 'graphql';

import { membershipFactory, tenantFactory } from '../../../../tests/factories/tenant';
import { render } from '../../../../tests/utils/rendering';
import { MembershipEntry, MembershipEntryProps } from '../membershipEntry.component';
import { deleteTenantMembershipMutation, updateTenantMembershipMutation } from '../membershipEntry.graphql';

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

  requestMock.newData = jest.fn(() => ({
    data,
  }));

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

    await userEvent.click(await screen.findByRole('button'));
    await userEvent.click(screen.getByRole('button', { name: /Change role/i }));
    await userEvent.click(screen.getByRole('button', { name: /Member/i }));
    expect(requestMock.newData).toHaveBeenCalled();
    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent('🎉 The user role was updated successfully!');
  });

  it('should commit delete mutation', async () => {
    const { membership, commonQueryMock, requestMock, refetch } = prepareMocks(deleteTenantMembershipMutation);

    render(<Component membership={membership} onAfterUpdate={refetch} />, {
      apolloMocks: [commonQueryMock, requestMock],
    });

    await userEvent.click(await screen.findByRole('button'));
    await userEvent.click(screen.getByText(/Delete/i));
    await userEvent.click(screen.getByText(/Continue/i));
    expect(requestMock.newData).toHaveBeenCalled();
    expect(refetch).toHaveBeenCalled();
    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent('🎉 User was deleted successfully!');
  });
});
