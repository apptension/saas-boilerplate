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

const mockFetch = jest.fn();
const originalFetch = global.fetch;
const originalLocation = window.location;

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch;
  Object.defineProperty(window, 'location', {
    value: { ...originalLocation, href: '', search: '' },
    writable: true,
  });
});

afterEach(() => {
  global.fetch = originalFetch;
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
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            sso_available: false,
            require_sso: false,
            connections: [],
          }),
      });

      const { waitForApolloMocks } = render(
        <SSODiscovery email="user@gmail.com" />
      );
      await waitForApolloMocks();

      expect(screen.queryByText(/sso available/i)).not.toBeInTheDocument();
    });

    it('should show single SSO connection when available', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            sso_available: true,
            require_sso: false,
            connections: [
              {
                id: 'conn-1',
                name: 'Okta',
                type: 'saml',
                tenant_id: 't1',
                tenant_name: 'Acme Corp',
                login_url: '/api/sso/saml/conn-1/login',
              },
            ],
          }),
      });

      const { waitForApolloMocks } = render(
        <SSODiscovery email="user@acme.com" />
      );
      await waitForApolloMocks();

      expect(await screen.findByText(/sso available for acme\.com/i, {}, { timeout: 2000 })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with okta/i })).toBeInTheDocument();
    });

    it('should call onSSORequired when require_sso is true', async () => {
      const onSSORequired = jest.fn();
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            sso_available: true,
            require_sso: true,
            connections: [
              {
                id: 'conn-1',
                name: 'Okta',
                type: 'saml',
                tenant_id: 't1',
                tenant_name: 'Acme Corp',
                login_url: '/api/sso/saml/conn-1/login',
              },
            ],
          }),
      });

      const { waitForApolloMocks } = render(
        <SSODiscovery email="user@acme.com" onSSORequired={onSSORequired} />
      );
      await waitForApolloMocks();

      await screen.findByText(/sso available for acme\.com/i, {}, { timeout: 2000 });
      expect(onSSORequired).toHaveBeenCalledWith(true);
    });

    it('should redirect to SSO login when continue button is clicked', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            sso_available: true,
            require_sso: false,
            connections: [
              {
                id: 'conn-1',
                name: 'Okta',
                type: 'saml',
                tenant_id: 't1',
                tenant_name: 'Acme Corp',
                login_url: '/api/sso/saml/conn-1/login',
              },
            ],
          }),
      });

      const { waitForApolloMocks } = render(
        <SSODiscovery email="user@acme.com" />
      );
      await waitForApolloMocks();

      await screen.findByText(/sso available for acme\.com/i, {}, { timeout: 2000 });
      await userEvent.click(screen.getByRole('button', { name: /continue with okta/i }));

      expect(window.location.href).toContain('/api/sso/saml/conn-1/login');
      expect(window.location.href).toContain('login_hint=user%40acme.com');
    });
  });
});
