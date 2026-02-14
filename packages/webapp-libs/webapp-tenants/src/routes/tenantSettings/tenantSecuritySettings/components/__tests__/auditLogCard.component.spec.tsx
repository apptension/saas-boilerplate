import { TenantUserRole, apiClient } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RoutesConfig } from '../../../../../config/routes';
import { membershipFactory, tenantFactory } from '../../../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../../../tests/utils/rendering';
import { AuditLogCard } from '../auditLogCard';

jest.mock('@sb/webapp-api-client/api', () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue({ data: [] }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  },
  apiURL: jest.fn((path: string) => path),
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const TENANT_ID = 'tenant-audit-1';

const createMockAuditLog = (overrides = {}) => ({
  id: 'log-1',
  eventType: 'sso_login_success',
  eventDescription: 'User signed in via SSO',
  userEmail: 'user@example.com',
  connectionName: 'Okta',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0',
  success: true,
  errorMessage: '',
  metadata: {},
  createdAt: '2024-01-15T10:00:00Z',
  ...overrides,
});

describe('AuditLogCard: Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApiClient.get.mockResolvedValue({
      data: {
        logs: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 20,
        hasMore: false,
        hasPrevious: false,
      },
    });
  });

  const renderComponent = () => {
    const tenant = tenantFactory({
      id: TENANT_ID,
      membership: membershipFactory({ role: TenantUserRole.OWNER }),
    });
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] }))];
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.security, { tenantId: TENANT_ID });

    return render(<AuditLogCard />, {
      apolloMocks,
      routerProps,
    });
  };

  it('should render card header', async () => {
    renderComponent();

    expect(await screen.findByText(/security audit log/i)).toBeInTheDocument();
    expect(await screen.findByText(/view recent security events/i)).toBeInTheDocument();
  });

  it('should show empty state when no logs', async () => {
    renderComponent();

    expect(await screen.findByText(/no security events yet/i)).toBeInTheDocument();
  });

  it('should display audit log entries', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: {
        logs: [createMockAuditLog()],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
        pageSize: 20,
        hasMore: false,
        hasPrevious: false,
      },
    });

    renderComponent();

    expect(await screen.findByText(/SSO login success/i)).toBeInTheDocument();
    expect(await screen.findByText('user@example.com')).toBeInTheDocument();
  });

  it('should toggle filters panel', async () => {
    renderComponent();

    await userEvent.click(await screen.findByRole('button', { name: /filters/i }));

    expect(await screen.findByPlaceholderText(/search logs/i)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /apply filters/i })).toBeInTheDocument();
  });

  it('should expand log entry to show details', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: {
        logs: [createMockAuditLog({ eventDescription: 'Test description', connectionName: 'Okta Prod' })],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
        pageSize: 20,
        hasMore: false,
        hasPrevious: false,
      },
    });

    renderComponent();

    const logEntry = await screen.findByText(/SSO login success/i);
    await userEvent.click(logEntry);

    expect(await screen.findByText('Test description')).toBeInTheDocument();
  });

  it('should show failed event with failed styling', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: {
        logs: [createMockAuditLog({ success: false, eventType: 'sso_login_failed' })],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
        pageSize: 20,
        hasMore: false,
        hasPrevious: false,
      },
    });

    renderComponent();

    expect(await screen.findByText(/SSO login failed/i)).toBeInTheDocument();
  });

  it('should show clear filters button when filters panel is open', async () => {
    renderComponent();

    await userEvent.click(await screen.findByRole('button', { name: /filters/i }));

    expect(await screen.findByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });

  it('should show pagination when multiple pages exist', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: {
        logs: Array(20).fill(null).map((_, i) => createMockAuditLog({ id: `log-${i}` })),
        totalCount: 50,
        totalPages: 3,
        currentPage: 1,
        pageSize: 20,
        hasMore: true,
        hasPrevious: false,
      },
    });

    renderComponent();

    expect(await screen.findByText(/50 events/i)).toBeInTheDocument();
  });
});
