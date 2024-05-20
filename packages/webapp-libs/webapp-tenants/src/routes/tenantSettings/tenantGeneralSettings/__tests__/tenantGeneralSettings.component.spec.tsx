import { TenantType as TenantTypeField } from '@sb/webapp-api-client/constants';
import { commonQueryCurrentUserQuery } from '@sb/webapp-api-client/providers';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RoutesConfig } from '../../../../config/routes';
import { tenantFactory } from '../../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { TenantGeneralSettings } from '../tenantGeneralSettings.component';
import { updateTenantMutation } from '../tenantGeneralSettings.graphql';

describe('TenantGeneralSettings: Component', () => {
  const Component = () => <TenantGeneralSettings />;

  it('should commit update mutation', async () => {
    const user = currentUserFactory({
      tenants: [
        tenantFactory({
          name: 'name',
          id: '1',
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);

    const variables = {
      input: { id: '1', name: 'name - new item name' },
    };

    const data = {
      createTenant: {
        tenant: variables.input,
      },
    };

    const requestMock = composeMockedQueryResult(updateTenantMutation, {
      variables,
      data,
    });

    const currentUserRefetchData = {
      ...user,
      tenants: [
        ...(user.tenants ?? []),
        tenantFactory({
          id: '1',
          name: variables.input.name,
          type: TenantTypeField.ORGANIZATION,
        }),
      ],
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

    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: '1' });

    render(<Component />, { apolloMocks: [commonQueryMock, requestMock, refetchMock], routerProps });

    await userEvent.type(await screen.findByPlaceholderText(/name/i), ' - new item name');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(requestMock.newData).toHaveBeenCalled();
    const toast = await screen.findByTestId('toast-1');

    expect(toast).toHaveTextContent('🎉 Organization updated successfully!');
  });
});
