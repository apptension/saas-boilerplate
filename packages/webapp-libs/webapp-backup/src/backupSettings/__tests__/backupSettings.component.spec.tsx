import type { MockedResponse } from '@apollo/client/testing';
import { TenantType as TenantTypeField } from '@sb/webapp-api-client/constants';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RoutesConfig } from '@sb/webapp-tenants/config/routes';
import { createMockRouterProps, render } from '@sb/webapp-tenants/src/tests/utils/rendering';
import { tenantFactory } from '@sb/webapp-tenants/src/tests/factories/tenant';

import { Tabs } from '@sb/webapp-core/components/ui/tabs';

import {
  backupConfigFactory,
  backupModuleFactory,
  backupRecordFactory,
  fillAvailableBackupModulesQuery,
  fillBackupConfigQuery,
  fillBackupEligibleRecipientsQuery,
  fillBackupRecordsQuery,
  fillRestoreRecordsQuery,
  fillTriggerBackupMutation,
  fillUpdateBackupConfigMutation,
} from '../../tests/factories';
import { BackupSettings } from '../backupSettings.component';

const MOCKED_TENANT_ID = 'tenant-backup-test-1';
const BACKUP_TAB_VALUE = 'en/tenant-backup-test-1/tenant/settings/backup';

jest.mock('@sb/webapp-tenants/hooks', () => {
  const actual = jest.requireActual('@sb/webapp-tenants/hooks');
  return {
    ...actual,
    PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    usePermissionCheck: () => ({ hasPermission: true, loading: false }),
    useGenerateTenantPath: () => () => BACKUP_TAB_VALUE,
  };
});

/** BackupSettings renders TabsContent; wrap in Tabs so the backup tab is active. */
const BackupSettingsWithTabs = () => (
  <Tabs value={BACKUP_TAB_VALUE}>
    <BackupSettings />
  </Tabs>
);

describe('BackupSettings: Component', () => {
  const Component = () => <BackupSettingsWithTabs />;

  const defaultMocks = (overrides: {
    config?: ReturnType<typeof backupConfigFactory> | null;
    records?: Array<ReturnType<typeof backupRecordFactory>>;
    modules?: Array<ReturnType<typeof backupModuleFactory>>;
  } = {}): MockedResponse[] => {
    const user = currentUserFactory({
      tenants: [
        tenantFactory({
          id: MOCKED_TENANT_ID,
          name: 'Test Org',
          type: TenantTypeField.ORGANIZATION,
        }),
      ],
    });
    const config = overrides.config ?? backupConfigFactory({ id: 'config-1', enabled: false });
    const records = overrides.records ?? [];
    const modules = overrides.modules ?? [backupModuleFactory({ id: 'management_dashboard' })];
    return [
      fillCommonQueryWithUser(user),
      fillBackupConfigQuery(config, MOCKED_TENANT_ID),
      fillBackupRecordsQuery(records, MOCKED_TENANT_ID),
      fillRestoreRecordsQuery([], MOCKED_TENANT_ID, 20),
      fillAvailableBackupModulesQuery(modules, MOCKED_TENANT_ID),
      fillBackupEligibleRecipientsQuery([], MOCKED_TENANT_ID),
    ];
  };

  it('renders backup configuration section when user has access', async () => {
    render(<Component />, {
      apolloMocks: (mocks: readonly MockedResponse[]) => [...defaultMocks(), ...mocks],
      routerProps: createMockRouterProps(RoutesConfig.tenant.settings.backup, { tenantId: MOCKED_TENANT_ID }),
    });

    await waitFor(() => {
      expect(screen.getByText(/Backup Configuration/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Configure periodic backups of your tenant data/i)).toBeInTheDocument();
    expect(screen.getByText(/Encryption at Rest/i)).toBeInTheDocument();
    expect(screen.getByText(/Backup History/i)).toBeInTheDocument();
  });

  it('renders backup history section with empty state when no backups', async () => {
    render(<Component />, {
      apolloMocks: (mocks: readonly MockedResponse[]) => [...defaultMocks(), ...mocks],
      routerProps: createMockRouterProps(RoutesConfig.tenant.settings.backup, { tenantId: MOCKED_TENANT_ID }),
    });

    await waitFor(() => {
      expect(screen.getByText(/Backup Configuration/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Backup History/i)).toBeInTheDocument();
    await expect(screen.findByText(/No backups yet/i)).resolves.toBeInTheDocument();
  });

  it('renders backup history section', async () => {
    render(<Component />, {
      apolloMocks: (mocks: readonly MockedResponse[]) => [...defaultMocks(), ...mocks],
      routerProps: createMockRouterProps(RoutesConfig.tenant.settings.backup, { tenantId: MOCKED_TENANT_ID }),
    });

    await waitFor(() => {
      expect(screen.getByText(/Backup History/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/View and manage your backup files/i)).toBeInTheDocument();
  });

  it('shows trigger backup button and triggers mutation on click when backups are enabled', async () => {
    const triggerMock = fillTriggerBackupMutation(MOCKED_TENANT_ID, true);
    render(<Component />, {
      apolloMocks: (mocks: readonly MockedResponse[]) => [
        ...defaultMocks({ config: backupConfigFactory({ enabled: true }) }),
        ...mocks,
        triggerMock,
      ],
      routerProps: createMockRouterProps(RoutesConfig.tenant.settings.backup, { tenantId: MOCKED_TENANT_ID }),
    });

    await waitFor(() => {
      expect(screen.getByText(/Backup Configuration/i)).toBeInTheDocument();
    });
    const triggerButton = await screen.findByRole('button', { name: /Trigger Backup/i });
    await waitFor(() => expect(triggerButton).not.toBeDisabled(), { timeout: 3000 });
    await userEvent.click(triggerButton);
    await waitFor(() => {
      expect(triggerMock.result).toHaveBeenCalled();
    });
  });

});
