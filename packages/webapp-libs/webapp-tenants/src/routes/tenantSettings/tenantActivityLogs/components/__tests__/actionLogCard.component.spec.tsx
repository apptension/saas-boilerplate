import { TenantUserRole } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RoutesConfig } from '../../../../../config/routes';
import { createPermissionsMock } from '../../../../../tests/factories/tenant';
import { membershipFactory, tenantFactory } from '../../../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../../../tests/utils/rendering';
import { ActionLogCard } from '../actionLogCard';
import { allActionLogsQuery } from '../../tenantActivityLogs.graphql';

const TENANT_ID = 'tenant-activity-logs-1';

const createActionLogsMock = (logs: Array<Record<string, unknown>> = [], totalCount = 0) => {
  return composeMockedQueryResult(allActionLogsQuery, {
    variables: {
      tenantId: TENANT_ID,
      first: 20,
      after: null,
    },
    data: {
      allActionLogs: {
        edges: logs.map((log) => ({
          node: {
            __typename: 'ActionLogType',
            id: log.id || 'log-1',
            actionType: log.actionType || 'CREATE',
            entityType: log.entityType || 'client',
            entityId: log.entityId || 'entity-1',
            entityName: log.entityName || null,
            actorType: log.actorType || 'USER',
            actorEmail: log.actorEmail || 'user@example.com',
            changes: log.changes || null,
            metadata: log.metadata || null,
            createdAt: log.createdAt || new Date().toISOString(),
          },
        })),
        pageInfo: { hasNextPage: false, endCursor: null, __typename: 'PageInfo' },
        totalCount,
      },
    },
  });
};

jest.mock('@sb/webapp-tenants/hooks', () => ({
  ...jest.requireActual('@sb/webapp-tenants/hooks'),
  usePermissionCheck: (perm: string) => ({
    hasPermission: perm === 'security.logs.export',
    loading: false,
  }),
}));

describe('ActionLogCard: Component', () => {
  it('should render disabled state when logging is off', async () => {
    const tenant = tenantFactory({
      id: TENANT_ID,
      actionLoggingEnabled: false,
      membership: membershipFactory({ role: TenantUserRole.OWNER }),
    });
    const apolloMocks = [
      fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] })),
      createPermissionsMock(TENANT_ID, ['security.logs.view', 'security.logs.export']),
    ];
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.activityLogs, { tenantId: TENANT_ID });

    render(<ActionLogCard />, { apolloMocks, routerProps });

    expect(await screen.findByText(/activity logging is disabled/i)).toBeInTheDocument();
  });

  it('should render empty state when logging is on and no logs', async () => {
    const tenant = tenantFactory({
      id: TENANT_ID,
      actionLoggingEnabled: true,
      membership: membershipFactory({ role: TenantUserRole.OWNER }),
    });
    const actionLogsMock = createActionLogsMock([], 0);
    const apolloMocks = [
      fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] })),
      createPermissionsMock(TENANT_ID, ['security.logs.view']),
      actionLogsMock,
    ];
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.activityLogs, { tenantId: TENANT_ID });

    const { waitForApolloMocks } = render(<ActionLogCard />, { apolloMocks, routerProps });
    await waitForApolloMocks();

    expect(await screen.findByText(/no activity yet/i)).toBeInTheDocument();
  });

  it('should render log entries when logs exist', async () => {
    const tenant = tenantFactory({
      id: TENANT_ID,
      actionLoggingEnabled: true,
      membership: membershipFactory({ role: TenantUserRole.OWNER }),
    });
    const actionLogsMock = createActionLogsMock(
      [
        {
          id: 'log-1',
          actionType: 'CREATE',
          entityType: 'client',
          entityName: 'Acme Corp',
          actorEmail: 'admin@example.com',
        },
      ],
      1
    );
    const apolloMocks = [
      fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] })),
      createPermissionsMock(TENANT_ID, ['security.logs.view']),
      actionLogsMock,
    ];
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.activityLogs, { tenantId: TENANT_ID });

    const { waitForApolloMocks } = render(<ActionLogCard />, { apolloMocks, routerProps });
    await waitForApolloMocks();

    expect(await screen.findByText(/created/i)).toBeInTheDocument();
    expect(await screen.findByText(/client/i)).toBeInTheDocument();
    expect(await screen.findByText(/acme corp/i)).toBeInTheDocument();
  });

  it('should toggle filters panel', async () => {
    const tenant = tenantFactory({
      id: TENANT_ID,
      actionLoggingEnabled: true,
      membership: membershipFactory({ role: TenantUserRole.OWNER }),
    });
    const actionLogsMock = createActionLogsMock([], 0);
    const apolloMocks = [
      fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] })),
      createPermissionsMock(TENANT_ID, ['security.logs.view']),
      actionLogsMock,
    ];
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.activityLogs, { tenantId: TENANT_ID });

    const { waitForApolloMocks } = render(<ActionLogCard />, { apolloMocks, routerProps });
    await waitForApolloMocks();

    await userEvent.click(await screen.findByRole('button', { name: /filters/i }));

    expect(await screen.findByPlaceholderText(/search logs/i)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /apply filters/i })).toBeInTheDocument();
  });

  it('should expand log entry to show details', async () => {
    const tenant = tenantFactory({
      id: TENANT_ID,
      actionLoggingEnabled: true,
      membership: membershipFactory({ role: TenantUserRole.OWNER }),
    });
    const actionLogsMock = createActionLogsMock(
      [
        {
          id: 'log-1',
          actionType: 'CREATE',
          entityType: 'client',
          entityId: 'entity-123',
          entityName: 'Acme Corp',
          actorEmail: 'admin@example.com',
        },
      ],
      1
    );
    const apolloMocks = [
      fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] })),
      createPermissionsMock(TENANT_ID, ['security.logs.view']),
      actionLogsMock,
    ];
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.activityLogs, { tenantId: TENANT_ID });

    const { waitForApolloMocks } = render(<ActionLogCard />, { apolloMocks, routerProps });
    await waitForApolloMocks();

    const logEntry = await screen.findByText(/created client/i);
    await userEvent.click(logEntry);

    expect(await screen.findByText(/entity id/i)).toBeInTheDocument();
    expect(await screen.findByText(/entity-123/)).toBeInTheDocument();
  });

  it('should show load more when hasNextPage', async () => {
    const tenant = tenantFactory({
      id: TENANT_ID,
      actionLoggingEnabled: true,
      membership: membershipFactory({ role: TenantUserRole.OWNER }),
    });
    const actionLogsMock = composeMockedQueryResult(allActionLogsQuery, {
      variables: { tenantId: TENANT_ID, first: 20, after: null },
      data: {
        allActionLogs: {
          edges: [{ node: { __typename: 'ActionLogType', id: 'log-1', actionType: 'CREATE', entityType: 'client', entityId: 'e1', entityName: null, actorType: 'USER', actorEmail: 'u@x.com', changes: null, metadata: null, createdAt: new Date().toISOString() } }],
          pageInfo: { hasNextPage: true, endCursor: 'cursor-1', __typename: 'PageInfo' },
          totalCount: 21,
        },
      },
    });
    const apolloMocks = [
      fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] })),
      createPermissionsMock(TENANT_ID, ['security.logs.view']),
      actionLogsMock,
    ];
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.activityLogs, { tenantId: TENANT_ID });

    const { waitForApolloMocks } = render(<ActionLogCard />, { apolloMocks, routerProps });
    await waitForApolloMocks();

    expect(await screen.findByRole('button', { name: /load more/i })).toBeInTheDocument();
  });
});
