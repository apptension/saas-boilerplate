import { apiClient } from '@sb/webapp-api-client/api';
import { ENV } from '@sb/webapp-core/config/env';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../../tests/utils/rendering';
import { PasskeysForm } from '../passkeysForm.component';

jest.mock('@sb/webapp-core/config/env', () => ({
  ENV: {
    ENABLE_PASSKEYS: true,
    BASE_API_URL: '/api',
  },
}));

const originalPublicKeyCredential = (global as any).PublicKeyCredential;

beforeEach(() => {
  jest.spyOn(apiClient, 'get').mockResolvedValue({ data: [] });
  jest.spyOn(apiClient, 'delete').mockResolvedValue(undefined);
  (global as any).PublicKeyCredential = jest.fn();
  (window as any).PublicKeyCredential = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
  (global as any).PublicKeyCredential = originalPublicKeyCredential;
  (window as any).PublicKeyCredential = originalPublicKeyCredential;
});

describe('PasskeysForm: Component', () => {
  describe('when passkeys are not supported', () => {
    it('should show not supported message when ENABLE_PASSKEYS is false', async () => {
      const originalEnablePasskeys = ENV.ENABLE_PASSKEYS;
      (ENV as any).ENABLE_PASSKEYS = false;

      const { waitForApolloMocks } = render(<PasskeysForm />);
      await waitForApolloMocks();

      expect(screen.getByText(/passkeys are not supported/i)).toBeInTheDocument();

      (ENV as any).ENABLE_PASSKEYS = originalEnablePasskeys;
    });

    it('should show not supported message when PublicKeyCredential is not available', async () => {
      (global as any).PublicKeyCredential = undefined;
      (window as any).PublicKeyCredential = undefined;

      const { waitForApolloMocks } = render(<PasskeysForm />);
      await waitForApolloMocks();

      expect(screen.getByText(/passkeys are not supported/i)).toBeInTheDocument();
    });
  });

  describe('when passkeys are supported', () => {
    it('should show empty state and add passkey button when no passkeys', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });

      const { waitForApolloMocks } = render(<PasskeysForm />);
      await waitForApolloMocks();

      expect(screen.getByText(/you haven't registered any passkeys yet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add passkey/i })).toBeInTheDocument();
    });

    it('should show passkeys list when passkeys exist', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: [
          {
            id: 'pk-1',
            name: 'MacBook Touch ID',
            authenticatorType: 'platform',
            createdAt: '2024-01-15T10:00:00Z',
            lastUsedAt: '2024-01-20T12:00:00Z',
            useCount: 5,
          },
        ],
      });

      const { waitForApolloMocks } = render(<PasskeysForm />);
      await waitForApolloMocks();

      expect(screen.getByText(/MacBook Touch ID/i)).toBeInTheDocument();
      expect(screen.getByText(/this device/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add another passkey/i })).toBeInTheDocument();
    });

    it('should open add passkey modal when add button is clicked', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });

      const { waitForApolloMocks } = render(<PasskeysForm />);
      await waitForApolloMocks();

      await userEvent.click(screen.getByRole('button', { name: /add passkey/i }));

      expect(screen.getAllByText(/register a passkey/i).length).toBeGreaterThan(0);
      expect(screen.getByLabelText(/give your passkey a name/i)).toBeInTheDocument();
    });
  });
});
