import {
  TenantScimTokensQueryDocument,
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
import { DirectorySyncCard } from '../directorySyncCard';

const TENANT_ID = 'tenant-scim-1';

const createSSOConnectionsMock = (connections: { id: string; name: string; connectionType: string; status: string }[]) =>
  composeMockedQueryResult(TenantSecuritySsoConnectionsQueryDocument, {
    data: {
      ssoConnections: {
        edges: connections.map((node) => ({ node })),
      },
    },
  });

const createSCIMTokensMock = (
  tokens: { id: string; name: string; tokenPrefix: string; isActive: boolean; createdAt: string; lastUsedAt: string | null; requestCount: number }[]
) =>
  composeMockedQueryResult(TenantScimTokensQueryDocument, {
    data: {
      scimTokens: {
        edges: tokens.map((node) => ({ node })),
      },
    },
  });

describe('DirectorySyncCard: Component', () => {
  const renderComponent = (
    canManageSSO = true,
    options?: {
      connections?: { id: string; name: string; connectionType: string; status: string }[];
      tokens?: { id: string; name: string; tokenPrefix: string; isActive: boolean; createdAt: string; lastUsedAt: string | null; requestCount: number }[];
    }
  ) => {
    const tenant = tenantFactory({
      id: TENANT_ID,
      membership: membershipFactory({ role: TenantUserRole.OWNER }),
    });
    const apolloMocks = [
      fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] })),
      createSSOConnectionsMock(options?.connections ?? []),
      createSCIMTokensMock(options?.tokens ?? []),
    ];
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
  });

  describe('when user can manage SSO', () => {
    it('should show directory sync requires SSO when no connections', async () => {
      renderComponent(true);

      expect(await screen.findByText(/directory sync requires SSO/i)).toBeInTheDocument();
      expect(await screen.findByText(/configure and activate an SSO connection first/i)).toBeInTheDocument();
    });

    it('should show ready to configure when SSO active but no tokens', async () => {
      renderComponent(true, {
        connections: [{ id: '1', name: 'Okta', connectionType: 'saml', status: 'active' }],
      });

      expect(await screen.findByText(/ready to configure directory sync/i)).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: /generate SCIM token/i })).toBeInTheDocument();
    });

    it('should show compatible identity providers', async () => {
      renderComponent(true, {
        connections: [{ id: '1', name: 'Okta', connectionType: 'saml', status: 'active' }],
      });

      expect(await screen.findByText(/compatible identity providers/i)).toBeInTheDocument();
      expect(screen.getByText('Okta')).toBeInTheDocument();
      expect(screen.getByText('Azure AD')).toBeInTheDocument();
    });

    it('should open generate token modal when button clicked', async () => {
      renderComponent(true, {
        connections: [{ id: '1', name: 'Okta', connectionType: 'saml', status: 'active' }],
      });

      await userEvent.click(await screen.findByRole('button', { name: /generate SCIM token/i }));

      expect(await screen.findByLabelText(/token name/i)).toBeInTheDocument();
    });

    it('should display SCIM endpoint and token list when tokens exist', async () => {
      renderComponent(true, {
        connections: [{ id: '1', name: 'Okta', connectionType: 'saml', status: 'active' }],
        tokens: [
          {
            id: 'token-1',
            name: 'Okta SCIM',
            tokenPrefix: 'sk_abc',
            isActive: true,
            createdAt: '2024-01-15',
            lastUsedAt: null,
            requestCount: 0,
          },
        ],
      });

      expect(await screen.findByText(/SCIM endpoint URL/i)).toBeInTheDocument();
      expect(await screen.findByText('Okta SCIM')).toBeInTheDocument();
    });
  });
});
