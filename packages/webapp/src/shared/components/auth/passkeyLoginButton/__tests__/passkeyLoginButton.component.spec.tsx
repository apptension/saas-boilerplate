import { ENV } from '@sb/webapp-core/config/env';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { act, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../../tests/utils/rendering';
import { PasskeyLoginButton } from '../passkeyLoginButton.component';

jest.mock('@sb/webapp-core/services/analytics');

const mockFetch = jest.fn();
const mockCredentialsGet = jest.fn();

const originalFetch = global.fetch;
const originalPublicKeyCredential = (global as any).PublicKeyCredential;
const originalLocation = window.location;

const mockUseLocation = jest.fn(() => ({ search: '' }));

jest.mock('@sb/webapp-core/config/env', () => ({
  ENV: {
    ENABLE_PASSKEYS: true,
    BASE_API_URL: '/api',
  },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useLocation: () => mockUseLocation(),
}));

beforeEach(() => {
  mockFetch.mockReset();
  mockCredentialsGet.mockReset();
  mockUseLocation.mockReturnValue({ search: '' });
  global.fetch = mockFetch;
  const mockFn = jest.fn();
  (global as any).PublicKeyCredential = mockFn;
  (window as any).PublicKeyCredential = mockFn;
  Object.defineProperty(navigator, 'credentials', {
    value: { get: mockCredentialsGet },
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, 'location', {
    value: { ...originalLocation, href: '', pathname: '/en/auth/login' },
    writable: true,
  });
});

afterEach(() => {
  global.fetch = originalFetch;
  (global as any).PublicKeyCredential = originalPublicKeyCredential;
  (window as any).PublicKeyCredential = originalPublicKeyCredential;
  Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
});

const mockAuthenticatorAssertionResponse = () => ({
  authenticatorData: new Uint8Array(37),
  clientDataJSON: new TextEncoder().encode('{}'),
  signature: new Uint8Array(64),
  userHandle: null,
});

const mockPublicKeyCredential = () =>
  ({
    rawId: new Uint8Array(32),
    response: mockAuthenticatorAssertionResponse(),
    type: 'public-key',
  }) as unknown as PublicKeyCredential;

describe('PasskeyLoginButton: Component', () => {
  describe('when passkeys are disabled', () => {
    it('should render nothing', () => {
      const originalEnablePasskeys = ENV.ENABLE_PASSKEYS;
      (ENV as any).ENABLE_PASSKEYS = false;

      render(<PasskeyLoginButton />);

      expect(screen.queryByRole('button', { name: /sign in with passkey/i })).not.toBeInTheDocument();
      (ENV as any).ENABLE_PASSKEYS = originalEnablePasskeys;
    });
  });

  describe('when PublicKeyCredential is not available', () => {
    it('should render nothing', () => {
      (global as any).PublicKeyCredential = undefined;
      (window as any).PublicKeyCredential = undefined;

      render(<PasskeyLoginButton />);

      expect(screen.queryByRole('button', { name: /sign in with passkey/i })).not.toBeInTheDocument();
    });
  });

  describe('when passkeys are enabled and WebAuthn is supported', () => {
    it('should render sign in button', async () => {
      render(<PasskeyLoginButton />);

      const button = await screen.findByRole('button', { name: /sign in with passkey/i });
      expect(button).toBeInTheDocument();
    });

    it('should show loading state when button is clicked', async () => {
      let resolveCredentials: (value: PublicKeyCredential) => void;
      const credentialsPromise = new Promise<PublicKeyCredential>((resolve) => {
        resolveCredentials = resolve;
      });
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              challenge: 'dGVzdC1jaGFsbGVuZ2U',
              timeout: 60000,
              rpId: 'localhost',
            }),
        })
        .mockResolvedValueOnce({ ok: true });
      mockCredentialsGet.mockReturnValue(credentialsPromise);

      render(<PasskeyLoginButton />);

      const button = await screen.findByRole('button', { name: /sign in with passkey/i });
      await userEvent.click(button);

      expect(await screen.findByText(/authenticating/i)).toBeInTheDocument();

      await act(async () => {
        resolveCredentials!(mockPublicKeyCredential());
      });
    });

    it('should show error when options fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      render(<PasskeyLoginButton />);

      await userEvent.click(await screen.findByRole('button', { name: /sign in with passkey/i }));

      expect(await screen.findByText(/failed to get authentication options/i)).toBeInTheDocument();
    });

    it('should show error when user cancels authentication', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            challenge: 'dGVzdC1jaGFsbGVuZ2U',
            timeout: 60000,
            rpId: 'localhost',
          }),
      });
      const notAllowedError = new Error('User cancelled');
      notAllowedError.name = 'NotAllowedError';
      mockCredentialsGet.mockRejectedValue(notAllowedError);

      render(<PasskeyLoginButton />);

      await userEvent.click(await screen.findByRole('button', { name: /sign in with passkey/i }));

      expect(await screen.findByText(/authentication was cancelled or timed out/i)).toBeInTheDocument();
    });

    it('should show error when verify request fails', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              challenge: 'dGVzdC1jaGFsbGVuZ2U',
              timeout: 60000,
              rpId: 'localhost',
            }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Invalid credential' }),
        });
      mockCredentialsGet.mockResolvedValue(mockPublicKeyCredential());

      render(<PasskeyLoginButton />);

      await userEvent.click(await screen.findByRole('button', { name: /sign in with passkey/i }));

      expect(await screen.findByText(/invalid credential/i)).toBeInTheDocument();
    });

    it('should track event and redirect on successful authentication', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              challenge: 'dGVzdC1jaGFsbGVuZ2U',
              timeout: 60000,
              rpId: 'localhost',
            }),
        })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      mockCredentialsGet.mockResolvedValue(mockPublicKeyCredential());

      render(<PasskeyLoginButton />);

      await userEvent.click(await screen.findByRole('button', { name: /sign in with passkey/i }));

      await waitFor(() => {
        expect(trackEvent).toHaveBeenCalledWith('auth', 'passkey-login');
      });
      expect(window.location.href).toBe('/en/');
    });

    it('should redirect to custom path when redirect param is present', async () => {
      mockUseLocation.mockReturnValue({ search: '?redirect=%2Fen%2Fprofile' });

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              challenge: 'dGVzdC1jaGFsbGVuZ2U',
              timeout: 60000,
              rpId: 'localhost',
            }),
        })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      mockCredentialsGet.mockResolvedValue(mockPublicKeyCredential());

      render(<PasskeyLoginButton />);

      await userEvent.click(await screen.findByRole('button', { name: /sign in with passkey/i }));

      await waitFor(() => {
        expect(window.location.href).toBe('/en/profile');
      });
    });
  });
});
