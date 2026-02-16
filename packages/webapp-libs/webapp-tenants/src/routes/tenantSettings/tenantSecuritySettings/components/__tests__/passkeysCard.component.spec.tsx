import {
  MyPasskeysQueryDocument,
  TenantPasskeysQueryDocument,
  TenantSecurityDeleteTenantPasskeyDocument,
  TenantUserRole,
} from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
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

const createTenantPasskeysMock = (passkeys: ReturnType<typeof createMockPasskey>[]) =>
  composeMockedQueryResult(TenantPasskeysQueryDocument, {
    variables: { search: undefined },
    data: { tenantPasskeys: passkeys },
  });

const createMyPasskeysMock = (passkeys: { id: string; name: string; authenticatorType: string; createdAt: string; lastUsedAt: string | null; useCount: number }[]) =>
  composeMockedQueryResult(MyPasskeysQueryDocument, {
    data: {
      myPasskeys: {
        edges: passkeys.map((node) => ({ node })),
      },
    },
  });

describe('PasskeysCard: Component', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'PublicKeyCredential', { value: {}, configurable: true });
  });

  const renderComponent = (canManagePasskeys = false, passkeys: ReturnType<typeof createMockPasskey>[] = []) => {
    const tenant = tenantFactory({
      id: TENANT_ID,
      membership: membershipFactory({ role: TenantUserRole.OWNER }),
    });
    const apolloMocks = [
      fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] })),
      canManagePasskeys ? createTenantPasskeysMock(passkeys) : createMyPasskeysMock(passkeys),
    ];
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
      renderComponent(false, [createMockPasskey()]);

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
      renderComponent(true, [createMockPasskey()]);

      expect(await screen.findByPlaceholderText(/search by user name or email/i)).toBeInTheDocument();
    });

    it('should show user info for admin view', async () => {
      renderComponent(true, [
        createMockPasskey({ userName: 'Admin User', userEmail: 'admin@company.com' }),
      ]);

      expect(await screen.findByText('Admin User')).toBeInTheDocument();
    });

    it('should show Device badge for platform authenticator', async () => {
      renderComponent(true, [createMockPasskey({ authenticatorType: 'platform' })]);

      expect(await screen.findByText('Device')).toBeInTheDocument();
    });

    it('should show search input when passkeys exist', async () => {
      renderComponent(true, [
        createMockPasskey({ name: 'MacBook', id: '1' }),
        createMockPasskey({ name: 'iPhone', id: '2' }),
      ]);

      const searchInput = await screen.findByPlaceholderText(/search by user name or email/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('delete passkey', () => {
    it.skip('should call delete and show toast on success', async () => {
      const deleteMock = composeMockedQueryResult(TenantSecurityDeleteTenantPasskeyDocument, {
          variables: { id: 'passkey-1' },
          data: { deleteTenantPasskey: { ok: true } },
        }
      );

      const tenant = tenantFactory({
        id: TENANT_ID,
        membership: membershipFactory({ role: TenantUserRole.OWNER }),
      });
      const apolloMocks = [
        fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] })),
        createTenantPasskeysMock([createMockPasskey()]),
        deleteMock,
      ];
      const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, {
        tenantId: TENANT_ID,
      });

      render(<PasskeysCard canManagePasskeys />, { apolloMocks, routerProps });

      await screen.findByText('MacBook Touch ID');

      const passkeyRow = (await screen.findByText('MacBook Touch ID')).closest('div');
      const deleteButton = passkeyRow ? within(passkeyRow as HTMLElement).getAllByRole('button').pop() : null;
      if (deleteButton) await userEvent.click(deleteButton);

      const toast = await screen.findByTestId('toast-1');
      expect(toast).toHaveTextContent(/deleted successfully/i);
    });
  });
});
