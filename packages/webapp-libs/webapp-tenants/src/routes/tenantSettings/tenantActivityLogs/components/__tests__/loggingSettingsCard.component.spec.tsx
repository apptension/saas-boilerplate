import { TenantUserRole } from '@sb/webapp-api-client';
import { commonQueryCurrentUserQuery } from '@sb/webapp-api-client/providers';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RoutesConfig } from '../../../../../config/routes';
import { membershipFactory, tenantFactory } from '../../../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../../../tests/utils/rendering';
import { LoggingSettingsCard } from '../loggingSettingsCard';
import { updateTenantActionLoggingMutation } from '../../tenantActivityLogs.graphql';

const TENANT_ID = 'tenant-activity-logs-1';

jest.mock('@sb/webapp-tenants/hooks', () => ({
  ...jest.requireActual('@sb/webapp-tenants/hooks'),
  usePermissionCheck: () => ({ hasPermission: true, loading: false }),
}));

describe('LoggingSettingsCard: Component', () => {
  it('should render with disabled state', async () => {
    const tenant = tenantFactory({
      id: TENANT_ID,
      actionLoggingEnabled: false,
      membership: membershipFactory({ role: TenantUserRole.OWNER }),
    });
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] }))];
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.activityLogs, { tenantId: TENANT_ID });

    render(<LoggingSettingsCard />, { apolloMocks, routerProps });

    expect(await screen.findByText(/activity logging is currently disabled/i)).toBeInTheDocument();
  });

  it('should render with enabled state', async () => {
    const tenant = tenantFactory({
      id: TENANT_ID,
      actionLoggingEnabled: true,
      membership: membershipFactory({ role: TenantUserRole.OWNER }),
    });
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] }))];
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.activityLogs, { tenantId: TENANT_ID });

    render(<LoggingSettingsCard />, { apolloMocks, routerProps });

    const enabledBadge = await screen.findByText('Enabled');
    expect(enabledBadge).toBeInTheDocument();
  });

  it('should call mutation and show toast when toggle is clicked', async () => {
    const tenant = tenantFactory({
      id: TENANT_ID,
      actionLoggingEnabled: false,
      membership: membershipFactory({ role: TenantUserRole.OWNER }),
    });
    const user = currentUserFactory({ tenants: [tenant] });
    const updateMock = composeMockedQueryResult(updateTenantActionLoggingMutation, {
      variables: { tenantId: TENANT_ID, enabled: true },
      data: { updateTenantActionLogging: { ok: true, tenant: { id: TENANT_ID, actionLoggingEnabled: true } } },
    });
    const updatedTenant = tenantFactory({
      id: TENANT_ID,
      actionLoggingEnabled: true,
      membership: membershipFactory({ role: TenantUserRole.OWNER }),
    });
    const refetchMock = composeMockedQueryResult(commonQueryCurrentUserQuery, {
      data: { currentUser: { ...user, tenants: [updatedTenant] } },
    });
    const apolloMocks = [
      fillCommonQueryWithUser(user),
      updateMock,
      refetchMock,
    ];
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.activityLogs, { tenantId: TENANT_ID });

    const { waitForApolloMocks } = render(<LoggingSettingsCard />, { apolloMocks, routerProps });

    const switchControl = await screen.findByRole('switch');
    await userEvent.click(switchControl);

    await waitForApolloMocks(1);

    const toast = await screen.findByTestId('toast-1', {}, { timeout: 3000 });
    expect(toast).toHaveTextContent(/settings updated/i);
  });
});
