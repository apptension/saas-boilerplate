import { TenantUserRole } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../tests/utils/rendering';
import { MembershipEntry } from './membershipEntry.component';
import { updateTenantMembershipMutation } from './membershipEntry.graphql';
import { membershipFactory, tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { CurrentTenantProvider } from '@sb/webapp-tenants/providers';

describe('MembershipEntry: Component', () => {
  it('should commit update mutation', async () => {
    jest.mock('react-router-dom', () => ({
      useParams: jest.fn().mockReturnValue({ tenantId: '2' }),
    }));
    const mockedId = '1';
    const tenantId = '2';
    const membership = membershipFactory({
      role: TenantUserRole.ADMIN,
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

    render(
      <CurrentTenantProvider>
        <MembershipEntry membership={membership} />
      </CurrentTenantProvider>,
      { apolloMocks: [commonQueryMock, requestMock] }
    );

    await userEvent.click(await screen.findByRole('button'));
    await userEvent.click(screen.getByRole('button', { name: /Change role/i }));
    await userEvent.click(screen.getByRole('button', { name: /Member/i }));
    expect(requestMock.newData).toHaveBeenCalled();
  });
});
