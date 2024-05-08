import { commonQueryCurrentUserQuery } from '@sb/webapp-api-client/providers';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RoutesConfig } from '../../../../config/routes';
import { tenantFactory } from '../../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { TenantDangerSettings } from '../tenantDangerSettings.component';
import { deleteTenantMutation } from '../tenantDangerSettings.graphql';

describe('TenantDangerSettings: Component', () => {
  const Component = () => <TenantDangerSettings />;

  it('should commit update mutation', async () => {
    const user = currentUserFactory({
      tenants: [
        tenantFactory({
          name: 'name',
          id: '1',
        })
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);

    const variables = {
      input: { id: '1' },
    };

    const data = {
      deleteTenant: {
        deletedIds: ['1']
      },
    };

    const requestMock = composeMockedQueryResult(deleteTenantMutation, {
      variables,
      data,
    });

    const currentUserRefetchData = {
      ...user,
      tenants: [],
    };

    const refetchMock = composeMockedQueryResult(commonQueryCurrentUserQuery, {
      data: currentUserRefetchData,
    });

    requestMock.newData = jest.fn(() => ({
      data,
    }));

    refetchMock.newData = jest.fn(() => ({
      data: {
        currentUser: currentUserRefetchData,
      },
    }));

    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.danger, { tenantId: '2' });

    render(<Component />, { apolloMocks: [commonQueryMock, requestMock, refetchMock], routerProps });
    await userEvent.click(await screen.findByRole('button', { name: /remove organisation/i }));
    expect(requestMock.newData).toHaveBeenCalled();
    const toast = await screen.findByTestId('toast-1');

    expect(toast).toHaveTextContent('🎉 Tenant removed successfully!');
  });
});
