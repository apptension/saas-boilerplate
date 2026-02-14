import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { RoutesConfig } from '../../../../config/routes';
import { currentUserPermissionsQuery } from '../../../../routes/tenantSettings/tenantRoles/tenantRoles.graphql';
import { AccessDenied } from '../../../../routes/accessDenied';
import { tenantFactory } from '../../../../tests/factories/tenant';
import {
  PLACEHOLDER_CONTENT,
  PLACEHOLDER_TEST_ID,
  CurrentTenantRouteWrapper,
  createMockRouterProps,
  render,
} from '../../../../tests/utils/rendering';

const TenantWrapper = CurrentTenantRouteWrapper;
import { PermissionAuthRoute } from '../permissionAuthRoute.component';

const TENANT_ID = 'tenant-permission-1';

const createTestRoutes = ({
  permissions,
  mode = 'any',
  fallback = 'accessDenied',
}: {
  permissions: string | string[];
  mode?: 'any' | 'all';
  fallback?: 'accessDenied' | 'home' | string;
}) => (
  <Routes>
    <Route
      path={RoutesConfig.tenant.settings.general}
      element={<PermissionAuthRoute permissions={permissions} mode={mode} fallback={fallback} />}
    >
      <Route index element={PLACEHOLDER_CONTENT} />
    </Route>
    <Route path={RoutesConfig.tenant.accessDenied} element={<AccessDenied />} />
    <Route path={RoutesConfig.home} element={<span data-testid="home">home</span>} />
  </Routes>
);

describe('PermissionAuthRoute: Component', () => {

  it('should render content when user has required permission', async () => {
    const tenant = tenantFactory({ id: TENANT_ID });
    const user = currentUserFactory({ tenants: [tenant] });
    const permissionsMock = composeMockedQueryResult(currentUserPermissionsQuery, {
      variables: { tenantId: TENANT_ID },
      data: { currentUserPermissions: ['org.settings.view'] },
    });
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: TENANT_ID });

    render(createTestRoutes({ permissions: 'org.settings.view' }), {
      apolloMocks: [fillCommonQueryWithUser(user), permissionsMock],
      routerProps,
      TenantWrapper,
    });

    expect(await screen.findByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });

  it('should redirect to access denied when user lacks permission', async () => {
    const tenant = tenantFactory({ id: TENANT_ID });
    const user = currentUserFactory({ tenants: [tenant] });
    const permissionsMock = composeMockedQueryResult(currentUserPermissionsQuery, {
      variables: { tenantId: TENANT_ID },
      data: { currentUserPermissions: ['members.view'] },
    });
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: TENANT_ID });

    render(createTestRoutes({ permissions: 'org.settings.edit' }), {
      apolloMocks: [fillCommonQueryWithUser(user), permissionsMock],
      routerProps,
      TenantWrapper,
    });

    expect(await screen.findByRole('heading', { name: /access denied/i })).toBeInTheDocument();
    expect(screen.queryByTestId(PLACEHOLDER_TEST_ID)).not.toBeInTheDocument();
  });

  it('should render content when user has any of multiple permissions (mode any)', async () => {
    const tenant = tenantFactory({ id: TENANT_ID });
    const user = currentUserFactory({ tenants: [tenant] });
    const permissionsMock = composeMockedQueryResult(currentUserPermissionsQuery, {
      variables: { tenantId: TENANT_ID },
      data: { currentUserPermissions: ['members.invite'] },
    });
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: TENANT_ID });

    render(createTestRoutes({ permissions: ['org.roles.manage', 'members.invite'], mode: 'any' }), {
      apolloMocks: [fillCommonQueryWithUser(user), permissionsMock],
      routerProps,
      TenantWrapper,
    });

    expect(await screen.findByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });

  it('should redirect when user lacks all permissions (mode all)', async () => {
    const tenant = tenantFactory({ id: TENANT_ID });
    const user = currentUserFactory({ tenants: [tenant] });
    const permissionsMock = composeMockedQueryResult(currentUserPermissionsQuery, {
      variables: { tenantId: TENANT_ID },
      data: { currentUserPermissions: ['org.roles.manage'] },
    });
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: TENANT_ID });

    render(createTestRoutes({ permissions: ['org.roles.manage', 'members.invite'], mode: 'all' }), {
      apolloMocks: [fillCommonQueryWithUser(user), permissionsMock],
      routerProps,
      TenantWrapper,
    });

    expect(await screen.findByRole('heading', { name: /access denied/i })).toBeInTheDocument();
  });

  it('should render content when user has all permissions (mode all)', async () => {
    const tenant = tenantFactory({ id: TENANT_ID });
    const user = currentUserFactory({ tenants: [tenant] });
    const permissionsMock = composeMockedQueryResult(currentUserPermissionsQuery, {
      variables: { tenantId: TENANT_ID },
      data: { currentUserPermissions: ['org.roles.manage', 'members.invite'] },
    });
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: TENANT_ID });

    render(createTestRoutes({ permissions: ['org.roles.manage', 'members.invite'], mode: 'all' }), {
      apolloMocks: [fillCommonQueryWithUser(user), permissionsMock],
      routerProps,
      TenantWrapper,
    });

    expect(await screen.findByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });

  it('should redirect to home when fallback is home and user lacks permission', async () => {
    const tenant = tenantFactory({ id: TENANT_ID });
    const user = currentUserFactory({ tenants: [tenant] });
    const permissionsMock = composeMockedQueryResult(currentUserPermissionsQuery, {
      variables: { tenantId: TENANT_ID },
      data: { currentUserPermissions: [] },
    });
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: TENANT_ID });

    render(createTestRoutes({ permissions: 'org.settings.edit', fallback: 'home' }), {
      apolloMocks: [fillCommonQueryWithUser(user), permissionsMock],
      routerProps,
      TenantWrapper,
    });

    expect(await screen.findByTestId('home')).toBeInTheDocument();
    expect(screen.queryByTestId(PLACEHOLDER_TEST_ID)).not.toBeInTheDocument();
  });
});
