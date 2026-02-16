import { SsoDiscoverDocument } from '@sb/webapp-api-client';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { ENV } from '@sb/webapp-core/config/env';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../../tests/utils/rendering';
import { SSODiscovery } from '../ssoDiscovery.component';

jest.mock('@sb/webapp-core/config/env', () => ({
  ENV: {
    ENABLE_SSO: true,
    BASE_API_URL: '/api',
  },
}));

const originalLocation = window.location;

const createSsoDiscoverMock = (
  email: string,
  data: { ssoAvailable: boolean; requireSso?: boolean; connections: { id: string; name: string; type: string; tenantId: string; tenantName: string; loginUrl: string }[] }
) =>
  composeMockedQueryResult(SsoDiscoverDocument, {
    variables: { email },
    data: {
      ssoDiscover: {
        ssoAvailable: data.ssoAvailable,
        requireSso: data.requireSso ?? false,
        connections: data.connections,
      },
    },
  });

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: { ...originalLocation, href: '', search: '' },
    writable: true,
  });
});

afterEach(() => {
  Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
});

describe('SSODiscovery: Component', () => {
  describe('when SSO is disabled', () => {
    it('should render nothing', async () => {
      const originalEnableSso = ENV.ENABLE_SSO;
      (ENV as any).ENABLE_SSO = false;

      const { waitForApolloMocks } = render(
        <SSODiscovery email="user@company.com" />
      );
      await waitForApolloMocks();

      expect(screen.queryByText(/sso available/i)).not.toBeInTheDocument();

      (ENV as any).ENABLE_SSO = originalEnableSso;
    });
  });

  describe('when SSO is enabled', () => {
    it('should render nothing when no SSO is available for email domain', async () => {
      const { waitForApolloMocks } = render(<SSODiscovery email="user@gmail.com" />, {
        apolloMocks: (defaultMocks) =>
          defaultMocks.concat(
            createSsoDiscoverMock('user@gmail.com', { ssoAvailable: false, connections: [] })
          ),
      });
      await waitForApolloMocks();

      expect(screen.queryByText(/sso available/i)).not.toBeInTheDocument();
    });

    it('should show single SSO connection when available', async () => {
      const connections = [
        {
          id: 'conn-1',
          name: 'Okta',
          type: 'saml',
          tenantId: 't1',
          tenantName: 'Acme Corp',
          loginUrl: '/api/sso/saml/conn-1/login',
        },
      ];
      const { waitForApolloMocks } = render(<SSODiscovery email="user@acme.com" />, {
        apolloMocks: (defaultMocks) =>
          defaultMocks.concat(
            createSsoDiscoverMock('user@acme.com', { ssoAvailable: true, connections })
          ),
      });
      await waitForApolloMocks();

      expect(await screen.findByText(/sso available for acme\.com/i, {}, { timeout: 2000 })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with okta/i })).toBeInTheDocument();
    });

    it('should call onSSORequired when require_sso is true', async () => {
      const onSSORequired = jest.fn();
      const connections = [
        {
          id: 'conn-1',
          name: 'Okta',
          type: 'saml',
          tenantId: 't1',
          tenantName: 'Acme Corp',
          loginUrl: '/api/sso/saml/conn-1/login',
        },
      ];
      const { waitForApolloMocks } = render(
        <SSODiscovery email="user@acme.com" onSSORequired={onSSORequired} />,
        {
          apolloMocks: (defaultMocks) =>
            defaultMocks.concat(
              createSsoDiscoverMock('user@acme.com', {
                ssoAvailable: true,
                requireSso: true,
                connections,
              })
            ),
        }
      );
      await waitForApolloMocks();

      await screen.findByText(/sso available for acme\.com/i, {}, { timeout: 2000 });
      expect(onSSORequired).toHaveBeenCalledWith(true);
    });

    it('should redirect to SSO login when continue button is clicked', async () => {
      const connections = [
        {
          id: 'conn-1',
          name: 'Okta',
          type: 'saml',
          tenantId: 't1',
          tenantName: 'Acme Corp',
          loginUrl: '/api/sso/saml/conn-1/login',
        },
      ];
      const { waitForApolloMocks } = render(<SSODiscovery email="user@acme.com" />, {
        apolloMocks: (defaultMocks) =>
          defaultMocks.concat(
            createSsoDiscoverMock('user@acme.com', { ssoAvailable: true, connections })
          ),
      });
      await waitForApolloMocks();

      await screen.findByText(/sso available for acme\.com/i, {}, { timeout: 2000 });
      await userEvent.click(screen.getByRole('button', { name: /continue with okta/i }));

      expect(window.location.href).toContain('/api/sso/saml/conn-1/login');
      expect(window.location.href).toContain('login_hint=user%40acme.com');
    });
  });
});
