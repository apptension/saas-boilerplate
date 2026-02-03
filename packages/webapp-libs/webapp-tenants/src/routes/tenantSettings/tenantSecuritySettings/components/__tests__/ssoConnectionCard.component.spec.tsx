import { TenantUserRole, apiClient } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RoutesConfig } from '../../../../../config/routes';
import { membershipFactory, tenantFactory } from '../../../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../../../tests/utils/rendering';
import { SSOConnectionCard } from '../ssoConnectionCard';

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

const createMockConnection = (overrides = {}) => ({
  id: 'conn-1',
  name: 'Okta Production',
  connectionType: 'saml',
  status: 'active',
  isActive: true,
  isSaml: true,
  isOidc: false,
  createdAt: '2024-01-15T10:00:00Z',
  lastLoginAt: '2024-12-20T14:30:00Z',
  loginCount: 42,
  spMetadataUrl: 'https://example.com/metadata',
  ...overrides,
});

describe('SSOConnectionCard: Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApiClient.get.mockResolvedValue({ data: [] });
  });

  const renderComponent = (canManageSSO = true) => {
    const tenant = tenantFactory({
      id: 'tenant-1',
      membership: membershipFactory({
        role: canManageSSO ? TenantUserRole.OWNER : TenantUserRole.MEMBER,
      }),
    });
    const user = currentUserFactory({
      tenants: [tenant],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);

    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, {
      tenantId: 'tenant-1',
    });

    return render(<SSOConnectionCard canManageSSO={canManageSSO} />, {
      apolloMocks: [commonQueryMock],
      routerProps,
    });
  };

  describe('when user can manage SSO', () => {
    describe('empty state', () => {
      it('should render empty state when no connections exist', async () => {
        renderComponent(true);

        expect(await screen.findByText(/No SSO connections configured/i)).toBeInTheDocument();
        expect(
          screen.getByText(/Enable enterprise authentication by connecting your identity provider/i)
        ).toBeInTheDocument();
      });

      it('should show Configure SSO button in empty state', async () => {
        renderComponent(true);

        await screen.findByText(/No SSO connections configured/i);
        expect(screen.getByRole('button', { name: /Configure SSO/i })).toBeInTheDocument();
      });

      it('should display supported identity providers', async () => {
        renderComponent(true);

        await screen.findByText(/No SSO connections configured/i);
        expect(screen.getByText(/Supported Identity Providers/i)).toBeInTheDocument();
        expect(screen.getByText('Okta')).toBeInTheDocument();
        expect(screen.getByText('Azure AD')).toBeInTheDocument();
        expect(screen.getByText('Auth0')).toBeInTheDocument();
      });
    });

    describe('with connections', () => {
      it('should display connection list when connections exist', async () => {
        const connections = [createMockConnection()];
        mockedApiClient.get.mockResolvedValue({ data: connections });

        renderComponent(true);

        expect(await screen.findByText('Okta Production')).toBeInTheDocument();
        expect(screen.getByText(/Active/i)).toBeInTheDocument();
        expect(screen.getByText('SAML 2.0')).toBeInTheDocument();
      });

      it('should show login count for connection', async () => {
        const connections = [createMockConnection({ loginCount: 42 })];
        mockedApiClient.get.mockResolvedValue({ data: connections });

        renderComponent(true);

        await screen.findByText('Okta Production');
        expect(screen.getByText(/42 logins/i)).toBeInTheDocument();
      });

      it('should show OIDC badge for OIDC connections', async () => {
        const connections = [
          createMockConnection({
            connectionType: 'oidc',
            isSaml: false,
            isOidc: true,
            name: 'Auth0 Integration',
          }),
        ];
        mockedApiClient.get.mockResolvedValue({ data: connections });

        renderComponent(true);

        await screen.findByText('Auth0 Integration');
        expect(screen.getByText('OIDC')).toBeInTheDocument();
      });

      it('should show Add Connection button in header when connections exist', async () => {
        const connections = [createMockConnection()];
        mockedApiClient.get.mockResolvedValue({ data: connections });

        renderComponent(true);

        await screen.findByText('Okta Production');
        expect(screen.getByRole('button', { name: /Add Connection/i })).toBeInTheDocument();
      });

      it('should show Add another connection button at bottom', async () => {
        const connections = [createMockConnection()];
        mockedApiClient.get.mockResolvedValue({ data: connections });

        renderComponent(true);

        await screen.findByText('Okta Production');
        expect(screen.getByRole('button', { name: /Add another connection/i })).toBeInTheDocument();
      });

      it('should display inactive connection with correct badge', async () => {
        const connections = [
          createMockConnection({
            isActive: false,
            status: 'inactive',
          }),
        ];
        mockedApiClient.get.mockResolvedValue({ data: connections });

        renderComponent(true);

        await screen.findByText('Okta Production');
        expect(screen.getByText(/Inactive/i)).toBeInTheDocument();
      });

      it('should display multiple connections', async () => {
        const connections = [
          createMockConnection({ id: '1', name: 'Okta Production' }),
          createMockConnection({
            id: '2',
            name: 'Google Workspace',
            connectionType: 'oidc',
            isSaml: false,
            isOidc: true,
          }),
        ];
        mockedApiClient.get.mockResolvedValue({ data: connections });

        renderComponent(true);

        expect(await screen.findByText('Okta Production')).toBeInTheDocument();
        expect(screen.getByText('Google Workspace')).toBeInTheDocument();
      });
    });

    describe('actions', () => {
      it('should open modal when Configure SSO is clicked', async () => {
        const user = userEvent.setup();
        renderComponent(true);

        const configureButton = await screen.findByRole('button', { name: /Configure SSO/i });
        await user.click(configureButton);

        // Modal should open
        expect(await screen.findByText(/Choose your SSO protocol to get started/i)).toBeInTheDocument();
      });

      it('should show actions dropdown on hover', async () => {
        const connections = [createMockConnection()];
        mockedApiClient.get.mockResolvedValue({ data: connections });

        renderComponent(true);

        // Wait for the connection to be displayed
        await screen.findByText('Okta Production');

        // The dropdown trigger button should exist (it becomes visible on hover)
        // It's initially hidden with opacity-0
        const actionsButtons = screen.getAllByRole('button');
        // One of the buttons should be the actions menu trigger
        const actionsButton = actionsButtons.find((btn) => btn.classList.contains('opacity-0'));
        expect(actionsButton).toBeDefined();
      });
    });
  });

  describe('when user cannot manage SSO', () => {
    it('should show permission message', async () => {
      renderComponent(false);

      expect(await screen.findByText(/Only organization owners and admins can configure SSO/i)).toBeInTheDocument();
    });

    it('should not show any action buttons', async () => {
      renderComponent(false);

      await screen.findByText(/Only organization owners and admins can configure SSO/i);
      expect(screen.queryByRole('button', { name: /Configure SSO/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Add Connection/i })).not.toBeInTheDocument();
    });

    it('should not fetch connections', async () => {
      renderComponent(false);

      await screen.findByText(/Only organization owners and admins can configure SSO/i);

      // API should not be called when user cannot manage SSO
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });
  });
});
