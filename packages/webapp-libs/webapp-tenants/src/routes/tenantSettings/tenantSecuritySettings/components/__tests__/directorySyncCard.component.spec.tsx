import { TenantUserRole, apiClient } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RoutesConfig } from '../../../../../config/routes';
import { membershipFactory, tenantFactory } from '../../../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../../../tests/utils/rendering';
import { DirectorySyncCard } from '../directorySyncCard';

jest.mock('@sb/webapp-api-client/api', () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue({ data: [] }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  },
  apiURL: jest.fn((path: string) => path),
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const TENANT_ID = 'tenant-scim-1';

describe('DirectorySyncCard: Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApiClient.get.mockResolvedValue({ data: [] });
  });

  const renderComponent = (canManageSSO = true) => {
    const tenant = tenantFactory({
      id: TENANT_ID,
      membership: membershipFactory({ role: TenantUserRole.OWNER }),
    });
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] }))];
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, { tenantId: TENANT_ID });

    return render(<DirectorySyncCard canManageSSO={canManageSSO} />, {
      apolloMocks,
      routerProps,
    });
  };

  describe('when user cannot manage SSO', () => {
    it('should show permission message', async () => {
      renderComponent(false);

      expect(
        await screen.findByText(/only organization owners and admins can configure directory sync/i)
      ).toBeInTheDocument();
    });

    it('should not fetch data', async () => {
      renderComponent(false);

      await screen.findByText(/only organization owners and admins can configure directory sync/i);

      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('when user can manage SSO', () => {
    it('should show directory sync requires SSO when no connections', async () => {
      mockedApiClient.get.mockImplementation((url) => {
        if (String(url).includes('connections')) return Promise.resolve({ data: [] });
        if (String(url).includes('scim-tokens')) return Promise.resolve({ data: [] });
        return Promise.resolve({ data: [] });
      });

      renderComponent(true);

      expect(await screen.findByText(/directory sync requires SSO/i)).toBeInTheDocument();
      expect(await screen.findByText(/configure and activate an SSO connection first/i)).toBeInTheDocument();
    });

    it('should show ready to configure when SSO active but no tokens', async () => {
      mockedApiClient.get.mockImplementation((url) => {
        if (String(url).includes('connections'))
          return Promise.resolve({
            data: [{ id: '1', name: 'Okta', connectionType: 'saml', status: 'active', isActive: true }],
          });
        if (String(url).includes('scim-tokens')) return Promise.resolve({ data: [] });
        return Promise.resolve({ data: [] });
      });

      renderComponent(true);

      expect(await screen.findByText(/ready to configure directory sync/i)).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: /generate SCIM token/i })).toBeInTheDocument();
    });

    it('should show compatible identity providers', async () => {
      mockedApiClient.get.mockImplementation((url) => {
        if (String(url).includes('connections'))
          return Promise.resolve({
            data: [{ id: '1', name: 'Okta', connectionType: 'saml', status: 'active', isActive: true }],
          });
        if (String(url).includes('scim-tokens')) return Promise.resolve({ data: [] });
        return Promise.resolve({ data: [] });
      });

      renderComponent(true);

      expect(await screen.findByText(/compatible identity providers/i)).toBeInTheDocument();
      expect(screen.getByText('Okta')).toBeInTheDocument();
      expect(screen.getByText('Azure AD')).toBeInTheDocument();
    });

    it('should open generate token modal when button clicked', async () => {
      mockedApiClient.get.mockImplementation((url) => {
        if (String(url).includes('connections'))
          return Promise.resolve({
            data: [{ id: '1', name: 'Okta', connectionType: 'saml', status: 'active', isActive: true }],
          });
        if (String(url).includes('scim-tokens')) return Promise.resolve({ data: [] });
        return Promise.resolve({ data: [] });
      });

      renderComponent(true);

      await userEvent.click(await screen.findByRole('button', { name: /generate SCIM token/i }));

      expect(await screen.findByLabelText(/token name/i)).toBeInTheDocument();
    });

    it('should display SCIM endpoint and token list when tokens exist', async () => {
      mockedApiClient.get.mockImplementation((url) => {
        if (String(url).includes('connections'))
          return Promise.resolve({
            data: [{ id: '1', name: 'Okta', connectionType: 'saml', status: 'active', isActive: true }],
          });
        if (String(url).includes('scim-tokens'))
          return Promise.resolve({
            data: [
              {
                id: 'token-1',
                name: 'Okta SCIM',
                tokenPrefix: 'sk_abc',
                createdAt: '2024-01-15',
                lastUsedAt: null,
                isActive: true,
                requestCount: 0,
              },
            ],
          });
        return Promise.resolve({ data: [] });
      });

      renderComponent(true);

      expect(await screen.findByText(/SCIM endpoint URL/i)).toBeInTheDocument();
      expect(await screen.findByText('Okta SCIM')).toBeInTheDocument();
    });
  });
});
