import {
  TenantSecuritySsoConnectionsQueryDocument,
  TenantUserRole,
} from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RoutesConfig } from '../../../../../config/routes';
import { membershipFactory, tenantFactory } from '../../../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../../../tests/utils/rendering';
import { SSOConnectionCard } from '../ssoConnectionCard';

const createMockConnection = (overrides = {}) => ({
  id: 'conn-1',
  name: 'Okta Production',
  connectionType: 'saml',
  status: 'active',
  allowedDomains: [],
  jitProvisioningEnabled: false,
  samlEntityId: null,
  samlSsoUrl: null,
  oidcIssuer: null,
  oidcClientId: null,
  lastLoginAt: '2024-12-20T14:30:00Z',
  loginCount: 42,
  createdAt: '2024-01-15T10:00:00Z',
  spMetadataUrl: 'https://example.com/metadata',
  ...overrides,
});

const createSSOConnectionsMock = (connections: ReturnType<typeof createMockConnection>[]) =>
  composeMockedQueryResult(TenantSecuritySsoConnectionsQueryDocument, {
    data: {
      ssoConnections: {
        edges: connections.map((node) => ({ node })),
      },
    },
  });

const createSSOConnectionsMock = (connections: ReturnType<typeof createMockConnection>[]) =>
  composeMockedQueryResult(TenantSecuritySsoConnectionsQueryDocument, {
    variables: { tenantId: 'tenant-1' },
    data: {
      ssoConnections: {
        edges: connections.map((node) => ({ node })),
      },
    },
  });

describe('SSOConnectionCard: Component', () => {
  const renderComponent = (canManageSSO = true, connections: ReturnType<typeof createMockConnection>[] = []) => {
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
    const ssoConnectionsMock = createSSOConnectionsMock(connections);

    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, {
      tenantId: 'tenant-1',
    });

    return render(<SSOConnectionCard canManageSSO={canManageSSO} />, {
      apolloMocks: [commonQueryMock, ssoConnectionsMock],
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

      it('should display automatic user provisioning info', async () => {
        renderComponent(true);

        await screen.findByText(/No SSO connections configured/i);
        expect(screen.getByText(/Automatic user provisioning/i)).toBeInTheDocument();
        expect(
          screen.getByText(/automatically created and added to your organization when they sign in via SSO/i)
        ).toBeInTheDocument();
      });
    });

    describe('with connections', () => {
      it('should display connection list when connections exist', async () => {
        renderComponent(true, [createMockConnection()]);

        expect(await screen.findByText('Okta Production')).toBeInTheDocument();
        expect(screen.getByText(/Active/i)).toBeInTheDocument();
        expect(screen.getByText('SAML 2.0')).toBeInTheDocument();
      });

      it('should show login count for connection', async () => {
        renderComponent(true, [createMockConnection({ loginCount: 42 })]);

        await screen.findByText('Okta Production');
        expect(screen.getByText(/42 logins/i)).toBeInTheDocument();
      });

      it('should show OIDC badge for OIDC connections', async () => {
        renderComponent(true, [
          createMockConnection({
            connectionType: 'oidc',
            name: 'Auth0 Integration',
          }),
        ]);

        await screen.findByText('Auth0 Integration');
        expect(screen.getByText('OIDC')).toBeInTheDocument();
      });

      it('should show Add Connection button in header when connections exist', async () => {
        renderComponent(true, [createMockConnection()]);

        await screen.findByText('Okta Production');
        expect(screen.getByRole('button', { name: /Add Connection/i })).toBeInTheDocument();
      });

      it('should show Add another connection button at bottom', async () => {
        renderComponent(true, [createMockConnection()]);

        await screen.findByText('Okta Production');
        expect(screen.getByRole('button', { name: /Add another connection/i })).toBeInTheDocument();
      });

      it('should display inactive connection with correct badge', async () => {
        renderComponent(true, [createMockConnection({ status: 'inactive' })]);

        await screen.findByText('Okta Production');
        expect(screen.getByText(/Inactive/i)).toBeInTheDocument();
      });

      it('should display multiple connections', async () => {
        renderComponent(true, [
          createMockConnection({ id: '1', name: 'Okta Production' }),
          createMockConnection({
            id: '2',
            name: 'Google Workspace',
            connectionType: 'oidc',
          }),
        ]);

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

        expect(await screen.findByText(/Choose your SSO protocol to get started/i)).toBeInTheDocument();
      });

      it('should show actions dropdown on hover', async () => {
        renderComponent(true, [createMockConnection()]);

        await screen.findByText('Okta Production');

        const actionsButtons = screen.getAllByRole('button');
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
  });
});
