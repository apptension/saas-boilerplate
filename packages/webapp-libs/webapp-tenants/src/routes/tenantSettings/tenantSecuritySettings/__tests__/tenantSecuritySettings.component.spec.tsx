import { TenantUserRole } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';

import { RoutesConfig } from '../../../../config/routes';
import { tenantFactory, membershipFactory } from '../../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
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

// Import after mock
import { apiClient } from '@sb/webapp-api-client/api';

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('TenantSecuritySettings: Component', () => {
  const Component = () => <TenantSecuritySettings />;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default mock for get
    mockedApiClient.get.mockResolvedValue({ data: [] });
  });

  describe('when user is owner/admin', () => {
    it('should render SSO card with header', async () => {
      const tenant = tenantFactory({
        id: '1',
        membership: membershipFactory({ role: TenantUserRole.OWNER }),
      });
      const user = currentUserFactory({
        tenants: [tenant],
      });
      const commonQueryMock = fillCommonQueryWithUser(user);

      const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, {
        tenantId: '1',
      });

      render(<Component />, { apolloMocks: [commonQueryMock], routerProps });

      // Wait for SSO card to render
      expect(await screen.findByText(/Single Sign-On/i)).toBeInTheDocument();
    });

    it('should render Directory Sync card', async () => {
      const tenant = tenantFactory({
        id: '1',
        membership: membershipFactory({ role: TenantUserRole.OWNER }),
      });
      const user = currentUserFactory({
        tenants: [tenant],
      });
      const commonQueryMock = fillCommonQueryWithUser(user);

      const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, {
        tenantId: '1',
      });

      render(<Component />, { apolloMocks: [commonQueryMock], routerProps });

      // Check for Directory Sync card
      expect(await screen.findByText(/Directory Sync/i)).toBeInTheDocument();
    });

    it('should render Audit Log card for owners', async () => {
      const tenant = tenantFactory({
        id: '1',
        membership: membershipFactory({ role: TenantUserRole.OWNER }),
      });
      const user = currentUserFactory({
        tenants: [tenant],
      });
      const commonQueryMock = fillCommonQueryWithUser(user);

      const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, {
        tenantId: '1',
      });

      render(<Component />, { apolloMocks: [commonQueryMock], routerProps });

      // Audit Log should be visible for owners/admins
      expect(await screen.findByText(/Audit Log/i)).toBeInTheDocument();
    });

    it('should show empty state for SSO when no connections exist', async () => {
      const tenant = tenantFactory({
        id: '1',
        membership: membershipFactory({ role: TenantUserRole.OWNER }),
      });
      const user = currentUserFactory({
        tenants: [tenant],
      });
      const commonQueryMock = fillCommonQueryWithUser(user);

      const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, {
        tenantId: '1',
      });

      render(<Component />, { apolloMocks: [commonQueryMock], routerProps });

      // Wait for the empty state to appear
      expect(await screen.findByText(/No SSO connections configured/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Configure SSO/i })).toBeInTheDocument();
    });
  });

  describe('when user is regular member', () => {
    it('should show permission message for SSO', async () => {
      const tenant = tenantFactory({
        id: '1',
        membership: membershipFactory({ role: TenantUserRole.MEMBER }),
      });
      const user = currentUserFactory({
        tenants: [tenant],
      });
      const commonQueryMock = fillCommonQueryWithUser(user);

      const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, {
        tenantId: '1',
      });

      render(<Component />, { apolloMocks: [commonQueryMock], routerProps });

      // SSO card should show permission message
      expect(
        await screen.findByText(/Only organization owners and admins can configure SSO/i)
      ).toBeInTheDocument();
    });

    it('should not show Audit Log card for members', async () => {
      const tenant = tenantFactory({
        id: '1',
        membership: membershipFactory({ role: TenantUserRole.MEMBER }),
      });
      const user = currentUserFactory({
        tenants: [tenant],
      });
      const commonQueryMock = fillCommonQueryWithUser(user);

      const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, {
        tenantId: '1',
      });

      render(<Component />, { apolloMocks: [commonQueryMock], routerProps });

      // Wait for SSO card to load first
      await screen.findByText(/Only organization owners and admins can configure SSO/i);

      // Audit Log should NOT be visible for regular members
      expect(screen.queryByText(/Audit Log/i)).not.toBeInTheDocument();
    });
  });
});
