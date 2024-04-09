import { MultitenancyTenantMembershipRoleChoices, TenantUserRole } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { membershipFactory, tenantFactory } from '../../../../tests/factories/tenant';
import { render } from '../../../../tests/utils/rendering';
import { MembershipEntry, MembershipEntryProps } from '../membershipEntry.component';
import { updateTenantMembershipMutation } from '../membershipEntry.graphql';

describe('MembershipEntry: Component', () => {
  const Component = (props: MembershipEntryProps) => <MembershipEntry {...props} />;
  it('should commit update mutation', async () => {
    const mockedId = '1';
    const tenantId = '2';
    const membership = membershipFactory({
      role: MultitenancyTenantMembershipRoleChoices.ADMIN,
      id: mockedId,
    });
    const user = currentUserFactory({
      tenants: [
        tenantFactory({
          name: 'name',
          id: tenantId,
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    const data = {
      tenantMembership: {
        id: mockedId,
      },
    };
    const variables = {
      input: {
        id: mockedId,
        tenantId,
        role: TenantUserRole.MEMBER,
      },
    };
    const requestMock = composeMockedQueryResult(updateTenantMembershipMutation, {
      variables,
      data,
    });

    requestMock.newData = jest.fn(() => ({
      data,
    }));

    const refetch = jest.fn();

    render(<Component membership={membership} onAfterUpdate={refetch} />, {
      apolloMocks: [commonQueryMock, requestMock],
    });

    await userEvent.click(await screen.findByRole('button'));
    await userEvent.click(screen.getByRole('button', { name: /Change role/i }));
    await userEvent.click(screen.getByRole('button', { name: /Member/i }));
    expect(requestMock.newData).toHaveBeenCalled();
    expect(refetch).toHaveBeenCalled();
    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent('🎉 The user role was updated successfully!');
  });
});
