import {
  composeMockedQueryResult,
  composeMockedListQueryResult,
  makeId,
} from '@sb/webapp-api-client/tests/utils';

import {
  availableBackupModulesQuery,
  backupConfigQuery,
  backupEligibleRecipientsQuery,
  backupRecordsQuery,
  restoreRecordsQuery,
  triggerBackupMutation,
  updateBackupConfigMutation,
} from '../../backupSettings/backupSettings.graphql';

const DEFAULT_TENANT_ID = 'tenant-1';

export const backupConfigFactory = (overrides: Record<string, unknown> = {}) => ({
  id: makeId(7),
  enabled: false,
  backupIntervalHours: 24,
  retentionDays: 30,
  emailRecipients: [],
  selectedModules: [],
  selectedModels: [],
  excludedModels: [],
  __typename: 'BackupConfigType' as const,
  ...overrides,
});

export const backupRecordFactory = (overrides: Record<string, unknown> = {}) => ({
  id: makeId(7),
  filePath: '',
  fileSize: null,
  status: 'COMPLETED',
  errorMessage: null,
  modelCounts: {},
  createdAt: new Date().toISOString(),
  downloadUrl: null,
  isEncrypted: true,
  __typename: 'BackupRecordType' as const,
  ...overrides,
});

export const backupModuleFactory = (overrides: Record<string, unknown> = {}) => ({
  id: 'management_dashboard',
  name: 'Management Dashboard',
  description: 'Financial and project data',
  modelCount: 5,
  __typename: 'BackupModuleType' as const,
  ...overrides,
});

export const fillBackupConfigQuery = (
  config: ReturnType<typeof backupConfigFactory> | null,
  tenantId: string = DEFAULT_TENANT_ID
) =>
  composeMockedQueryResult(backupConfigQuery, {
    variables: { tenantId },
    data: { backupConfig: config },
  });

export const fillBackupRecordsQuery = (
  records: Array<ReturnType<typeof backupRecordFactory>>,
  tenantId: string = DEFAULT_TENANT_ID,
  first: number = 50
) =>
  composeMockedListQueryResult(backupRecordsQuery, 'backupRecords', 'BackupRecordType', {
    variables: { tenantId, first },
    data: records,
  });

export const fillRestoreRecordsQuery = (
  records: unknown[] = [],
  tenantId: string = DEFAULT_TENANT_ID,
  first: number = 20
) =>
  composeMockedListQueryResult(restoreRecordsQuery, 'restoreRecords', 'RestoreRecordType', {
    variables: { tenantId, first },
    data: records,
  });

export const fillAvailableBackupModulesQuery = (
  modules: Array<ReturnType<typeof backupModuleFactory>>,
  tenantId: string = DEFAULT_TENANT_ID
) =>
  composeMockedQueryResult(availableBackupModulesQuery, {
    variables: { tenantId },
    data: { availableBackupModules: modules },
  });

export const fillBackupEligibleRecipientsQuery = (
  recipients: Array<{ id: string; userId: string; firstName?: string; lastName?: string; userEmail?: string; invitationAccepted?: boolean }> = [],
  tenantId: string = DEFAULT_TENANT_ID
) =>
  composeMockedQueryResult(backupEligibleRecipientsQuery as import('graphql').DocumentNode, {
    variables: { tenantId },
    data: {
      backupEligibleRecipients: recipients.map((m) => ({ __typename: 'TenantMembershipType' as const, ...m })),
    },
  });

export const fillTriggerBackupMutation = (tenantId: string = DEFAULT_TENANT_ID, ok = true, error: string | null = null) =>
  composeMockedQueryResult(triggerBackupMutation, {
    variables: { tenantId },
    data: {
      triggerBackup: {
        ok,
        error,
        backupId: ok ? makeId(7) : null,
        __typename: 'TriggerBackupMutationPayload',
      },
    },
  });

export const fillUpdateBackupConfigMutation = (
  input: {
    tenantId: string;
    enabled?: boolean;
    backupIntervalHours?: number;
    retentionDays?: number;
    emailRecipients?: string[];
    selectedModules?: string[];
    selectedModels?: string[];
    excludedModels?: string[];
  },
  ok = true
) =>
  composeMockedQueryResult(updateBackupConfigMutation, {
    variables: { input },
    data: {
      updateBackupConfig: {
        ok,
        error: null,
        backupConfig: input,
        __typename: 'UpdateBackupConfigMutationPayload',
      },
    },
  });
