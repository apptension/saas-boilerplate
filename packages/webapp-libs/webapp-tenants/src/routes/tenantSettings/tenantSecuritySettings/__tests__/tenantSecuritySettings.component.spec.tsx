import { TenantUserRole, apiClient } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen, waitFor } from '@testing-library/react';

import { RoutesConfig } from '../../../../config/routes';
import { membershipFactory, tenantFactory } from '../../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { currentUserPermissionsQuery } from '../../tenantRoles/tenantRoles.graphql';
import { TenantSecuritySettings } from '../tenantSecuritySettings.component';

// Mock the apiClient module before any imports use it
jest.mock('@sb/webapp-api-client/api', () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue({ data: [] }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  },
  apiURL: jest.fn((path: string) => path),
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const MOCKED_TENANT_ID = '1';

const createPermissionsMock = (permissions: string[] = []) => {
  return composeMockedQueryResult(currentUserPermissionsQuery, {
    variables: { tenantId: MOCKED_TENANT_ID },
    data: {
      currentUserPermissions: permissions,
    },
  });
};

describe('TenantSecuritySettings: Component', () => {
  const Component = () => <TenantSecuritySettings />;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default mock for get
    mockedApiClient.get.mockResolvedValue({ data: [] });
  });

  describe('when user has SSO management permissions', () => {
    it('should render SSO card with header', async () => {
      const tenant = tenantFactory({
        id: MOCKED_TENANT_ID,
        membership: membershipFactory({ role: TenantUserRole.OWNER }),
      });
      const user = currentUserFactory({
        tenants: [tenant],
      });
      const commonQueryMock = fillCommonQueryWithUser(user);
      const permissionsMock = createPermissionsMock([
        'security.sso.manage',
        'security.passkeys.manage',
        'security.logs.view',
      ]);

      const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, {
        tenantId: MOCKED_TENANT_ID,
      });

      render(<Component />, { apolloMocks: [commonQueryMock, permissionsMock], routerProps });

      // Wait for SSO card to render
      expect(await screen.findByText(/Single Sign-On/i)).toBeInTheDocument();
    });

    it('should render Directory Sync (SCIM) card', async () => {
      const tenant = tenantFactory({
        id: MOCKED_TENANT_ID,
        membership: membershipFactory({ role: TenantUserRole.OWNER }),
      });
      const user = currentUserFactory({
        tenants: [tenant],
      });
      const commonQueryMock = fillCommonQueryWithUser(user);
      const permissionsMock = createPermissionsMock([
        'security.sso.manage',
        'security.passkeys.manage',
        'security.logs.view',
      ]);

      const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, {
        tenantId: MOCKED_TENANT_ID,
      });

      render(<Component />, { apolloMocks: [commonQueryMock, permissionsMock], routerProps });

      // Check for Directory Sync (SCIM) card - title includes "SCIM"
      expect(await screen.findByText(/Directory Sync \(SCIM\)/i)).toBeInTheDocument();
    });

    it('should render Audit Log card when user has view logs permission', async () => {
      const tenant = tenantFactory({
        id: MOCKED_TENANT_ID,
        membership: membershipFactory({ role: TenantUserRole.OWNER }),
      });
      const user = currentUserFactory({
        tenants: [tenant],
      });
      const commonQueryMock = fillCommonQueryWithUser(user);
      const permissionsMock = createPermissionsMock([
        'security.sso.manage',
        'security.passkeys.manage',
        'security.logs.view',
      ]);

      const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, {
        tenantId: MOCKED_TENANT_ID,
      });

      render(<Component />, { apolloMocks: [commonQueryMock, permissionsMock], routerProps });

      // Audit Log should be visible when user has security.logs.view permission
      expect(await screen.findByText(/Audit Log/i)).toBeInTheDocument();
    });

    it('should show empty state for SSO when no connections exist', async () => {
      const tenant = tenantFactory({
        id: MOCKED_TENANT_ID,
        membership: membershipFactory({ role: TenantUserRole.OWNER }),
      });
      const user = currentUserFactory({
        tenants: [tenant],
      });
      const commonQueryMock = fillCommonQueryWithUser(user);
      const permissionsMock = createPermissionsMock([
        'security.sso.manage',
        'security.passkeys.manage',
        'security.logs.view',
      ]);

      const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, {
        tenantId: MOCKED_TENANT_ID,
      });

      render(<Component />, { apolloMocks: [commonQueryMock, permissionsMock], routerProps });

      // Wait for the empty state to appear
      await waitFor(() => {
        expect(screen.getByText(/No SSO connections configured/i)).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /Configure SSO/i })).toBeInTheDocument();
    });
  });

  describe('when user does not have SSO permissions', () => {
    it('should show permission message for SSO', async () => {
      const tenant = tenantFactory({
        id: MOCKED_TENANT_ID,
        membership: membershipFactory({ role: TenantUserRole.MEMBER }),
      });
      const user = currentUserFactory({
        tenants: [tenant],
      });
      const commonQueryMock = fillCommonQueryWithUser(user);
      // No SSO permissions
      const permissionsMock = createPermissionsMock([]);

      const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, {
        tenantId: MOCKED_TENANT_ID,
      });

      render(<Component />, { apolloMocks: [commonQueryMock, permissionsMock], routerProps });

      // SSO card should show permission message
      expect(await screen.findByText(/Only organization owners and admins can configure SSO/i)).toBeInTheDocument();
    });

    it('should not show Audit Log card when user lacks logs permission', async () => {
      const tenant = tenantFactory({
        id: MOCKED_TENANT_ID,
        membership: membershipFactory({ role: TenantUserRole.MEMBER }),
      });
      const user = currentUserFactory({
        tenants: [tenant],
      });
      const commonQueryMock = fillCommonQueryWithUser(user);
      // No logs permission
      const permissionsMock = createPermissionsMock([]);

      const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, {
        tenantId: MOCKED_TENANT_ID,
      });

      render(<Component />, { apolloMocks: [commonQueryMock, permissionsMock], routerProps });

      // Wait for SSO card to load first
      await screen.findByText(/Only organization owners and admins can configure SSO/i);

      // Audit Log should NOT be visible when user lacks permission
      expect(screen.queryByText(/Audit Log/i)).not.toBeInTheDocument();
    });
  });
});
