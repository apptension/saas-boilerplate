import { TenantUserRole } from '@sb/webapp-api-client';
import { commonQueryCurrentUserQuery } from '@sb/webapp-api-client/providers';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RoutesConfig } from '../../../config/routes';
import { membershipFactory, tenantFactory } from '../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../tests/utils/rendering';
import { TenantDangerZone } from '../tenantDangerZone.component';
import { deleteTenantMutation } from '../tenantDangerZone.graphql';

describe('TenantDangerSettings: Component', () => {
  const Component = () => <TenantDangerZone />;

  it('should render title', async () => {
    const user = currentUserFactory({
      tenants: [
        tenantFactory({
          name: 'name',
          id: '1',
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: '1' });

    render(<Component />, { apolloMocks: [commonQueryMock], routerProps });

    expect(await screen.findByText('Danger Zone')).toBeInTheDocument();
  });

  it('should render delete organization', async () => {
    const user = currentUserFactory({
      tenants: [
        tenantFactory({
          name: 'name',
          id: '1',
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: '1' });

    render(<Component />, { apolloMocks: [commonQueryMock], routerProps });

    expect(await screen.findByText('Delete this organization')).toBeInTheDocument();
    expect(screen.getByText('Remove organization')).toBeInTheDocument();
  });

  it('should render delete organization subtitle about permissions', async () => {
    const user = currentUserFactory({
      tenants: [
        tenantFactory({
          name: 'name',
          id: '1',
          membership: membershipFactory({ role: TenantUserRole.MEMBER }),
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: '1' });

    render(<Component />, { apolloMocks: [commonQueryMock], routerProps });

    const button = await screen.findByRole('button', { name: /remove organization/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Only members with the Owner role can delete organization')).toBeInTheDocument();
  });

  it('should delete organization', async () => {
    const user = currentUserFactory({
      tenants: [
        tenantFactory({
          name: 'name',
          id: '1',
          membership: membershipFactory({ role: TenantUserRole.OWNER }),
        }),
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);

    const variables = {
      input: { id: '1' },
    };
    const data = {
      deleteTenant: {
        deletedIds: ['1'],
        // clientMutationId prevents errors in the console
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

    const button = await screen.findByRole('button', { name: /remove organization/i });
    await userEvent.click(button);

    const continueButton = await screen.findByRole('button', { name: /continue/i });
    await userEvent.click(continueButton);

    expect(requestMock.newData).toHaveBeenCalled();
    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent('🎉 Organization deleted successfully!');
  });
});
