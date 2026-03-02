import { TenantType as TenantTypeField } from '@sb/webapp-api-client/constants';
import { commonQueryCurrentUserQuery } from '@sb/webapp-api-client/providers';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RoutesConfig } from '../../../../config/routes';
import { currentUserPermissionsQuery } from '../../tenantRoles/tenantRoles.graphql';
import { tenantFactory } from '../../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { TenantGeneralSettings } from '../tenantGeneralSettings.component';
import { updateTenantMutation } from '../tenantGeneralSettings.graphql';

const MOCKED_TENANT_ID = '1';

const createPermissionsMock = (permissions: string[] = []) => {
  return composeMockedQueryResult(currentUserPermissionsQuery, {
    variables: { tenantId: MOCKED_TENANT_ID },
    data: {
      currentUserPermissions: permissions,
    },
  });
};

describe('TenantGeneralSettings: Component', () => {
  const Component = () => <TenantGeneralSettings />;

  it('should commit update mutation', async () => {
    const user = currentUserFactory({
      tenants: [
        tenantFactory({
          name: 'name',
          id: MOCKED_TENANT_ID,
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    // Mock permissions to allow editing
    const permissionsMock = createPermissionsMock(['org.settings.edit', 'org.delete']);

    const variables = {
      input: { id: MOCKED_TENANT_ID, name: 'name - new item name' },
    };

    const data = {
      updateTenant: {
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
          id: MOCKED_TENANT_ID,
          name: variables.input.name,
          type: TenantTypeField.ORGANIZATION,
        }),
      ],
    };

    const refetchMock = composeMockedQueryResult(commonQueryCurrentUserQuery, {
      data: currentUserRefetchData,
    });

    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: MOCKED_TENANT_ID });

    render(<Component />, { apolloMocks: [commonQueryMock, permissionsMock, requestMock, refetchMock], routerProps });

    // Wait for permissions to load and form to be enabled
    const nameInput = await screen.findByPlaceholderText(/name/i);
    await waitFor(() => {
      expect(nameInput).not.toBeDisabled();
    });

    await userEvent.type(nameInput, ' - new item name');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    // Wait for the toast first (proves mutation completed), then verify mock was called
    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent('Organization updated successfully!');
    expect(requestMock.result).toHaveBeenCalled();
  });
});
