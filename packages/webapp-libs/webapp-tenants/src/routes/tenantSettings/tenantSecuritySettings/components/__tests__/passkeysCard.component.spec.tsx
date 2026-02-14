import { TenantUserRole, apiClient } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RoutesConfig } from '../../../../../config/routes';
import { membershipFactory, tenantFactory } from '../../../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../../../tests/utils/rendering';
import { PasskeysCard } from '../passkeysCard';

jest.mock('@sb/webapp-api-client/api', () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue({ data: [] }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  },
  apiURL: jest.fn((path: string) => path),
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const TENANT_ID = 'tenant-passkeys-1';

const createMockPasskey = (overrides = {}) => ({
  id: 'passkey-1',
  name: 'MacBook Touch ID',
  authenticatorType: 'platform',
  createdAt: '2024-01-15T10:00:00Z',
  lastUsedAt: '2024-12-20T14:30:00Z',
  useCount: 42,
  userEmail: 'user@example.com',
  userName: 'Test User',
  ...overrides,
});

describe('PasskeysCard: Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApiClient.get.mockResolvedValue({ data: [] });
    Object.defineProperty(window, 'PublicKeyCredential', { value: {}, configurable: true });
  });

  const renderComponent = (canManagePasskeys = false) => {
    const tenant = tenantFactory({
      id: TENANT_ID,
      membership: membershipFactory({ role: TenantUserRole.OWNER }),
    });
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] }))];
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, { tenantId: TENANT_ID });

    return render(<PasskeysCard canManagePasskeys={canManagePasskeys} />, {
      apolloMocks,
      routerProps,
    });
  };

  describe('user view (canManagePasskeys: false)', () => {
    it('should render empty state with Add Passkey button', async () => {
      renderComponent(false);

      expect(await screen.findByText(/no passkeys registered/i)).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: /add passkey/i })).toBeInTheDocument();
    });

    it('should render passkey list with Add another passkey button', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [createMockPasskey()] });

      renderComponent(false);

      expect(await screen.findByText('MacBook Touch ID')).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: /add another passkey/i })).toBeInTheDocument();
    });

    it('should open Add Passkey modal when button clicked', async () => {
      renderComponent(false);

      await userEvent.click(await screen.findByRole('button', { name: /add passkey/i }));

      expect(await screen.findByLabelText(/give your passkey a name/i)).toBeInTheDocument();
    });
  });

  describe('admin view (canManagePasskeys: true)', () => {
    it('should render admin description when no passkeys', async () => {
      renderComponent(true);

      expect(await screen.findByText(/manage passkeys for all users/i)).toBeInTheDocument();
    });

    it('should render search input when passkeys exist', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [createMockPasskey()] });

      renderComponent(true);

      expect(await screen.findByPlaceholderText(/search by user name or email/i)).toBeInTheDocument();
    });

    it('should show user info for admin view', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: [createMockPasskey({ userName: 'Admin User', userEmail: 'admin@company.com' })],
      });

      renderComponent(true);

      expect(await screen.findByText('Admin User')).toBeInTheDocument();
    });

    it('should show Device badge for platform authenticator', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: [createMockPasskey({ authenticatorType: 'platform' })],
      });

      renderComponent(true);

      expect(await screen.findByText('Device')).toBeInTheDocument();
    });

    it('should filter passkeys by search', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: [
          createMockPasskey({ id: '1', name: 'MacBook', userEmail: 'a@x.com' }),
          createMockPasskey({ id: '2', name: 'iPhone', userEmail: 'b@y.com' }),
        ],
      });

      renderComponent(true);

      await screen.findByText('MacBook');
      const searchInput = screen.getByPlaceholderText(/search by user name or email/i);
      await userEvent.type(searchInput, 'iphone');

      expect(screen.getByText('iPhone')).toBeInTheDocument();
      expect(screen.queryByText('MacBook')).not.toBeInTheDocument();
    });

    it('should show no match message when search has no results', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [createMockPasskey({ name: 'MacBook' })] });

      renderComponent(true);

      await screen.findByText('MacBook');
      const searchInput = screen.getByPlaceholderText(/search by user name or email/i);
      await userEvent.type(searchInput, 'nonexistent');

      expect(await screen.findByText(/no passkeys match your search/i)).toBeInTheDocument();
    });
  });

  describe('delete passkey', () => {
    it('should call delete and show toast on success', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [createMockPasskey()] });
      mockedApiClient.delete.mockResolvedValue({});

      renderComponent(false);

      const passkeyRow = (await screen.findByText('MacBook Touch ID')).closest('.rounded-lg.border');
      const deleteButton = within(passkeyRow!).getByRole('button');
      await userEvent.click(deleteButton);

      expect(await screen.findByText(/passkey deleted successfully/i)).toBeInTheDocument();
      expect(mockedApiClient.delete).toHaveBeenCalled();
    });
  });
});
