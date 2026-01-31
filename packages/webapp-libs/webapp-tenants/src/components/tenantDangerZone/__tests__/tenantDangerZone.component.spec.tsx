import { TenantUserRole } from '@sb/webapp-api-client';
import { commonQueryCurrentUserQuery } from '@sb/webapp-api-client/providers';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RoutesConfig } from '../../../config/routes';
import { currentUserPermissionsQuery } from '../../../routes/tenantSettings/tenantRoles/tenantRoles.graphql';
import { membershipFactory, tenantFactory } from '../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../tests/utils/rendering';
import { TenantDangerZone } from '../tenantDangerZone.component';
import { deleteTenantMutation } from '../tenantDangerZone.graphql';

const MOCKED_TENANT_ID = '1';

const createPermissionsMock = (permissions: string[] = []) => {
  return composeMockedQueryResult(currentUserPermissionsQuery, {
    variables: { tenantId: MOCKED_TENANT_ID },
    data: {
      currentUserPermissions: permissions,
    },
  });
};

describe('TenantDangerSettings: Component', () => {
  const Component = () => <TenantDangerZone />;

  it('should render title', async () => {
    const user = currentUserFactory({
      tenants: [
        tenantFactory({
          name: 'name',
          id: MOCKED_TENANT_ID,
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: MOCKED_TENANT_ID });

    render(<Component />, { apolloMocks: [commonQueryMock], routerProps });

    expect(await screen.findByText('Danger Zone')).toBeInTheDocument();
  });

  it('should render delete organization', async () => {
    const user = currentUserFactory({
      tenants: [
        tenantFactory({
          name: 'name',
          id: MOCKED_TENANT_ID,
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: MOCKED_TENANT_ID });

    render(<Component />, { apolloMocks: [commonQueryMock], routerProps });

    expect(await screen.findByText('Delete this organization')).toBeInTheDocument();
    expect(screen.getByText('Delete organization')).toBeInTheDocument();
  });

  it('should render no permission message when user cannot delete', async () => {
    const user = currentUserFactory({
      tenants: [
        tenantFactory({
          name: 'name',
          id: MOCKED_TENANT_ID,
          membership: membershipFactory({ role: TenantUserRole.MEMBER }),
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    // Mock permissions query to return no delete permission
    const permissionsMock = createPermissionsMock([]);
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: MOCKED_TENANT_ID });

    render(<Component />, { apolloMocks: [commonQueryMock, permissionsMock], routerProps });

    const button = await screen.findByRole('button', { name: /delete organization/i });
    expect(button).toBeInTheDocument();

    // Wait for permissions to load and check for no permission message
    await waitFor(() => {
      expect(
        screen.getByText(/You don't have permission to delete this organization/i)
      ).toBeInTheDocument();
    });
  });

  it('should delete organization when user has permission', async () => {
    const user = currentUserFactory({
      tenants: [
        tenantFactory({
          name: 'name',
          id: MOCKED_TENANT_ID,
          membership: membershipFactory({ role: TenantUserRole.OWNER }),
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    // Mock permissions query to return delete permission
    const permissionsMock = createPermissionsMock(['org.delete']);

    const variables = {
      input: { id: MOCKED_TENANT_ID },
    };
    const data = {
      deleteTenant: {
        deletedIds: [MOCKED_TENANT_ID],
        clientMutationId: '123',
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

    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: MOCKED_TENANT_ID });
    render(<Component />, {
      apolloMocks: [commonQueryMock, permissionsMock, requestMock, refetchMock],
      routerProps,
    });

    // Wait for the button to be enabled (permissions loaded)
    const button = await screen.findByRole('button', { name: /delete organization/i });

    // Wait for the button to be enabled
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    await userEvent.click(button);

    // Wait for dialog to open and find Continue button
    const continueButton = await screen.findByRole('button', { name: /continue/i });
    await userEvent.click(continueButton);

    // Wait for the toast (proves mutation completed)
    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent('Organization deleted successfully!');
    expect(requestMock.result).toHaveBeenCalled();
  });
});
