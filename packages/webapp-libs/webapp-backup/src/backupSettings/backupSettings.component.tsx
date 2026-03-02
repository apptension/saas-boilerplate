import { useMutation, useQuery } from '@apollo/client/react';
import {
  BackupBackupRecordStatusChoices,
  BackupRestoreRecordStatusChoices,
  ConflictStrategyEnum,
} from '@sb/webapp-api-client/graphql';
import { TenantType } from '@sb/webapp-api-client/constants';
import { Button } from '@sb/webapp-core/components/buttons';
import { Alert, AlertDescription, AlertTitle } from '@sb/webapp-core/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Checkbox } from '@sb/webapp-core/components/forms/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@sb/webapp-core/components/ui/dialog';
import { Input } from '@sb/webapp-core/components/ui/input';
import { Label } from '@sb/webapp-core/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@sb/webapp-core/components/ui/radio-group';
import { Switch } from '@sb/webapp-core/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@sb/webapp-core/components/ui/table';
import { TabsContent } from '@sb/webapp-core/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@sb/webapp-core/components/ui/tooltip';
import { useToast } from '@sb/webapp-core/toast';
import { BackupStatusBadge } from './backupStatusBadge.component';
import { RoutesConfig } from '@sb/webapp-tenants/config/routes';
import { useGenerateTenantPath, usePermissionCheck } from '@sb/webapp-tenants/hooks';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import {
  ChevronDown,
  ChevronRight,
  Download,
  FileArchive,
  History,
  Loader2,
  Lock,
  RotateCcw,
  Shield,
  Trash2,
} from 'lucide-react';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  availableBackupModulesQuery,
  availableBackupModelsQuery,
  backupConfigQuery,
  backupEligibleRecipientsQuery,
  backupRecordsQuery,
  deleteBackupMutation,
  downloadBackupDecryptedMutation,
  restoreBackupMutation,
  restoreRecordsQuery,
  triggerBackupMutation,
  updateBackupConfigMutation,
} from './backupSettings.graphql';

const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatModelCountsForTooltip = (modelCounts: any): ReactNode => {
  if (!modelCounts) return null;
  let parsed: any = modelCounts;
  if (typeof modelCounts === 'string') {
    try {
      parsed = JSON.parse(modelCounts);
    } catch {
      return null;
    }
  }
  if (typeof parsed !== 'object') return null;
  const modelNames = Object.keys(parsed).sort();
  if (modelNames.length === 0) return null;
  return (
    <div className="space-y-1.5">
      {modelNames.map((modelName) => {
        const counts = parsed[modelName];
        if (typeof counts !== 'object') return null;
        const hasAny = (counts.created || 0) + (counts.updated || 0) + (counts.skipped || 0) + (counts.failed || 0) > 0;
        if (!hasAny) return null;
        return (
          <div key={modelName} className="border-b border-border/50 pb-1.5 last:border-0 last:pb-0">
            <div className="font-medium text-xs mb-1">{modelName}</div>
            <div className="space-y-0.5 text-xs">
              {counts.created > 0 && (
                <div className="text-green-600">
                  <FormattedMessage
                    defaultMessage="  • {count, plural, one {# created} other {# created}}"
                    id="Backup Settings / Restore Tooltip Created"
                    values={{ count: counts.created }}
                  />
                </div>
              )}
              {counts.updated > 0 && (
                <div className="text-blue-600">
                  <FormattedMessage
                    defaultMessage="  • {count, plural, one {# updated} other {# updated}}"
                    id="Backup Settings / Restore Tooltip Updated"
                    values={{ count: counts.updated }}
                  />
                </div>
              )}
              {counts.skipped > 0 && (
                <div className="text-muted-foreground">
                  <FormattedMessage
                    defaultMessage="  • {count, plural, one {# skipped} other {# skipped}}"
                    id="Backup Settings / Restore Tooltip Skipped"
                    values={{ count: counts.skipped }}
                  />
                </div>
              )}
              {counts.failed > 0 && (
                <div className="text-red-600">
                  <FormattedMessage
                    defaultMessage="  • {count, plural, one {# failed} other {# failed}}"
                    id="Backup Settings / Restore Tooltip Failed"
                    values={{ count: counts.failed }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ModuleModelsList = ({
  moduleId,
  excludedModels,
  onExcludedModelsChange,
  updating,
}: {
  moduleId: string;
  excludedModels: string[];
  onExcludedModelsChange: (models: string[]) => void;
  updating: boolean;
}) => {
  const { data: currentTenant } = useCurrentTenant();
  const tenantId = currentTenant?.id ?? '';
  const { data, loading } = useQuery(availableBackupModelsQuery, {
    variables: { tenantId, moduleId },
    skip: !moduleId || !tenantId,
  });
  const models = data?.availableBackupModels || [];

  if (loading) {
    return (
      <div className="ml-6 flex items-center justify-center py-2">
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (models.length === 0) return null;

  return (
    <div className="ml-6 mt-2 space-y-1 rounded-md border bg-muted/30 p-2">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        <FormattedMessage defaultMessage="Select models to include (uncheck to exclude)" id="Backup Settings / Models Subtitle" />
      </p>
      {models.map((model: any) => {
        const isIncluded = !excludedModels.includes(model.fullName);
        return (
          <div key={model.fullName} className="flex items-center gap-2">
            <Checkbox
              id={`include-${model.fullName}`}
              checked={isIncluded}
              onCheckedChange={(checked) => {
                if (checked) {
                  onExcludedModelsChange(excludedModels.filter((m) => m !== model.fullName));
                } else {
                  onExcludedModelsChange([...excludedModels, model.fullName]);
                }
              }}
              disabled={updating}
            />
            <Label htmlFor={`include-${model.fullName}`} className="flex-1 cursor-pointer text-sm font-normal">
              {model.displayName} <span className="text-xs text-muted-foreground">({model.fullName})</span>
            </Label>
          </div>
        );
      })}
    </div>
  );
};

export const BackupSettings = () => {
  const intl = useIntl();
  const { toast } = useToast();
  const { data: currentTenant } = useCurrentTenant();
  const generateTenantPath = useGenerateTenantPath();
  const tenantId = currentTenant?.id ?? '';
  const isPersonal = currentTenant?.type === TenantType.PERSONAL;
  const { hasPermission: canManage } = usePermissionCheck('backup.manage');
  const canAccess = canManage || isPersonal;

  const [enabled, setEnabled] = useState(false);
  const [backupIntervalDays, setBackupIntervalDays] = useState(1);
  const [retentionDays, setRetentionDays] = useState(30);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [excludedModels, setExcludedModels] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const { data: configData, loading: configLoading, refetch: refetchConfig } = useQuery(backupConfigQuery, {
    variables: { tenantId },
    skip: !tenantId,
  });

  const { data: modulesData, loading: modulesLoading } = useQuery(availableBackupModulesQuery, {
    variables: { tenantId },
    skip: !canAccess || !tenantId,
  });

  useEffect(() => {
    if (configData?.backupConfig) {
      setEnabled(configData.backupConfig.enabled);
      setBackupIntervalDays(Math.round((configData.backupConfig.backupIntervalHours || 24) / 24));
      setRetentionDays(configData.backupConfig.retentionDays);
      setSelectedUserIds((configData.backupConfig.emailRecipients || []).filter((id): id is string => id !== null));
      setSelectedModules((configData.backupConfig.selectedModules || []).filter((m): m is string => m !== null));
      setSelectedModels((configData.backupConfig.selectedModels || []).filter((m): m is string => m !== null));
      setExcludedModels((configData.backupConfig.excludedModels || []).filter((m): m is string => m !== null));
    }
  }, [configData]);

  const { data: recordsData, loading: recordsLoading, refetch: refetchRecords } = useQuery(backupRecordsQuery, {
    variables: { tenantId, first: 50 },
    skip: !tenantId,
    fetchPolicy: 'cache-and-network',
  });

  const { data: eligibleRecipientsData } = useQuery(backupEligibleRecipientsQuery as any, {
    variables: { tenantId },
    skip: !tenantId,
  });

  const members = useMemo(() => {
    const list = (eligibleRecipientsData as { backupEligibleRecipients?: Array<{ userId?: string | null; firstName?: string | null; lastName?: string | null; userEmail?: string | null }> })?.backupEligibleRecipients;
    return (list?.filter((m): m is NonNullable<typeof m> & { userId: string } => Boolean(m && m.userId)) ?? []);
  }, [eligibleRecipientsData]);

  const [updateConfig, { loading: updating }] = useMutation(updateBackupConfigMutation, {
    onCompleted: (data) => {
      if (data?.updateBackupConfig?.ok) {
        toast({ description: intl.formatMessage({ defaultMessage: 'Backup settings updated successfully', id: 'Backup Settings / Update Success' }), variant: 'success' });
        refetchConfig();
      } else {
        toast({
          description: data?.updateBackupConfig?.error || intl.formatMessage({ defaultMessage: 'Failed to update backup settings', id: 'Backup Settings / Update Error' }),
          variant: 'destructive',
        });
      }
    },
    onError: (error) => toast({ description: error.message, variant: 'destructive' }),
  });

  const [triggerBackup, { loading: triggering }] = useMutation(triggerBackupMutation, {
    onCompleted: (data) => {
      if (data?.triggerBackup?.ok) {
        toast({ description: intl.formatMessage({ defaultMessage: 'Backup triggered successfully', id: 'Backup Settings / Trigger Success' }), variant: 'success' });
        setTimeout(() => refetchRecords(), 2000);
      } else {
        toast({
          description: data?.triggerBackup?.error || intl.formatMessage({ defaultMessage: 'Failed to trigger backup', id: 'Backup Settings / Trigger Error' }),
          variant: 'destructive',
        });
      }
    },
    onError: (error) => toast({ description: error.message, variant: 'destructive' }),
  });

  const [downloadBackup, { loading: downloading }] = useMutation(downloadBackupDecryptedMutation, {
    onCompleted: (data) => {
      if (data?.downloadBackupDecrypted?.ok && data?.downloadBackupDecrypted?.content) {
        const blob = new Blob([data.downloadBackupDecrypted.content], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-${new Date().toISOString().split('T')[0]}.xml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ description: intl.formatMessage({ defaultMessage: 'Backup downloaded successfully', id: 'Backup Settings / Download Success' }), variant: 'success' });
      } else {
        toast({
          description: data?.downloadBackupDecrypted?.error || intl.formatMessage({ defaultMessage: 'Failed to download backup', id: 'Backup Settings / Download Error' }),
          variant: 'destructive',
        });
      }
    },
    onError: (error) => toast({ description: error.message, variant: 'destructive' }),
  });

  const [deleteBackup] = useMutation(deleteBackupMutation, {
    onCompleted: (data) => {
      if (data?.deleteBackup?.ok) {
        toast({ description: intl.formatMessage({ defaultMessage: 'Backup deleted successfully', id: 'Backup Settings / Delete Success' }), variant: 'success' });
        refetchRecords();
      } else {
        toast({
          description: data?.deleteBackup?.error || intl.formatMessage({ defaultMessage: 'Failed to delete backup', id: 'Backup Settings / Delete Error' }),
          variant: 'destructive',
        });
      }
    },
    onError: (error) => toast({ description: error.message, variant: 'destructive' }),
  });

  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoreBackupId, setRestoreBackupId] = useState<string | null>(null);
  const [conflictStrategy, setConflictStrategy] = useState<ConflictStrategyEnum>(ConflictStrategyEnum.SKIP);

  const { data: restoreData, loading: restoreLoading, refetch: refetchRestoreRecords } = useQuery(restoreRecordsQuery, {
    variables: { tenantId, first: 20 },
    skip: !tenantId,
    fetchPolicy: 'cache-and-network',
  });

  const [restoreBackup, { loading: restoring }] = useMutation(restoreBackupMutation, {
    onCompleted: (data) => {
      if (data?.restoreBackup?.ok) {
        toast({
          description: intl.formatMessage({
            defaultMessage: 'Backup restoration started. You will be notified when it completes.',
            id: 'Backup Settings / Restore Started',
          }),
          variant: 'success',
        });
        setRestoreDialogOpen(false);
        setTimeout(() => refetchRestoreRecords(), 3000);
      } else {
        toast({
          description: data?.restoreBackup?.error || intl.formatMessage({ defaultMessage: 'Failed to start backup restoration', id: 'Backup Settings / Restore Error' }),
          variant: 'destructive',
        });
      }
    },
    onError: (error) => toast({ description: error.message, variant: 'destructive' }),
  });

  const handleOpenRestoreDialog = (backupId: string) => {
    setRestoreBackupId(backupId);
    setConflictStrategy(ConflictStrategyEnum.SKIP);
    setRestoreDialogOpen(true);
  };

  const handleRestore = () => {
    if (!restoreBackupId) return;
    restoreBackup({ variables: { backupId: restoreBackupId, conflictStrategy } });
  };

  const restoreRecords = restoreData?.restoreRecords?.edges?.map((edge: any) => edge?.node).filter(Boolean) || [];

  const saveConfig = (overrides?: { enabled?: boolean }) => {
    if (!tenantId) return;
    const effectiveEnabled = overrides?.enabled ?? enabled;
    updateConfig({
      variables: {
        input: {
          tenantId,
          enabled: effectiveEnabled,
          backupIntervalHours: backupIntervalDays * 24,
          retentionDays,
          emailRecipients: selectedUserIds,
          selectedModules: selectedModules.length > 0 ? selectedModules : undefined,
          selectedModels: selectedModels.length > 0 ? selectedModels : undefined,
          excludedModels: excludedModels.length > 0 ? excludedModels : undefined,
        },
      },
    });
  };

  const handleSave = () => saveConfig();

  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    saveConfig({ enabled: checked });
  };

  const handleTriggerBackup = () => {
    if (!tenantId) return;
    triggerBackup({ variables: { tenantId } });
  };

  const handleDeleteBackup = (backupId: string) => {
    deleteBackup({ variables: { backupId } });
  };

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const backupRecords = recordsData?.backupRecords?.edges?.map((edge) => edge?.node).filter(Boolean) || [];

  const hasProcessingBackups = useMemo(
    () => backupRecords.some((b) => b?.status === BackupBackupRecordStatusChoices.PROCESSING),
    [backupRecords]
  );
  const hasProcessingRestores = useMemo(
    () => restoreRecords.some((r) => r?.status === BackupRestoreRecordStatusChoices.PROCESSING),
    [restoreRecords]
  );

  // Terminal statuses for backup records (enum values) – once we see one of these we stop treating as processing.
  const backupTerminalStatuses = useMemo(
    () => [BackupBackupRecordStatusChoices.COMPLETED, BackupBackupRecordStatusChoices.FAILED],
    []
  );

  // Sticky set of backup IDs we've seen as PROCESSING: prevents action buttons from
  // flickering visible during the 5s refetch (when response can briefly be stale/in-flight).
  const processingBackupIdsRef = useRef<Set<string>>(new Set());
  if (hasProcessingBackups) {
    backupRecords.forEach((b) => {
      if (!b?.id) return;
      const s = b?.status;
      if (s === BackupBackupRecordStatusChoices.PROCESSING) processingBackupIdsRef.current.add(b.id);
      else if (s && backupTerminalStatuses.includes(s)) processingBackupIdsRef.current.delete(b.id);
    });
  } else {
    processingBackupIdsRef.current.clear();
  }

  useEffect(() => {
    if (!hasProcessingBackups) return;
    const interval = setInterval(() => refetchRecords(), 5000);
    return () => clearInterval(interval);
  }, [hasProcessingBackups, refetchRecords]);

  useEffect(() => {
    if (!hasProcessingRestores) return;
    const interval = setInterval(() => refetchRestoreRecords(), 5000);
    return () => clearInterval(interval);
  }, [hasProcessingRestores, refetchRestoreRecords]);

  if (!canAccess) {
    return (
      <TabsContent value={generateTenantPath(RoutesConfig.tenant.settings.backup)}>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              <FormattedMessage defaultMessage="You don't have permission to manage backup settings" id="Backup Settings / No Permission" />
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  return (
    <TabsContent value={generateTenantPath(RoutesConfig.tenant.settings.backup)}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileArchive className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  <FormattedMessage defaultMessage="Backup Configuration" id="Backup Settings / Title" />
                </CardTitle>
                <CardDescription>
                  <FormattedMessage defaultMessage="Configure periodic backups of your tenant data" id="Backup Settings / Description" />
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="info">
              <Shield className="h-4 w-4" />
              <AlertTitle>
                <FormattedMessage defaultMessage="Encryption at Rest" id="Backup Settings / Encryption Title" />
              </AlertTitle>
              <AlertDescription>
                <FormattedMessage
                  defaultMessage="All backups are encrypted at rest using AES-256-GCM encryption. Each tenant has a unique encryption key stored securely. Backups are automatically encrypted when created and decrypted in-memory when downloaded."
                  id="Backup Settings / Encryption Description"
                />
              </AlertDescription>
            </Alert>

            {configLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>
                      <FormattedMessage defaultMessage="Enable Backups" id="Backup Settings / Enable Label" />
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      <FormattedMessage defaultMessage="Automatically backup tenant data" id="Backup Settings / Enable Description" />
                    </p>
                  </div>
                  <Switch checked={enabled} onCheckedChange={handleEnabledChange} disabled={updating} />
                </div>

                {enabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="backup-interval">
                        <FormattedMessage defaultMessage="Backup Interval (days)" id="Backup Settings / Interval Label" />
                      </Label>
                      <Input
                        id="backup-interval"
                        type="number"
                        min="1"
                        value={String(backupIntervalDays)}
                        onChange={(e) => setBackupIntervalDays(parseInt(e.target.value, 10) || 1)}
                        disabled={updating}
                      />
                      <p className="text-sm text-muted-foreground">
                        <FormattedMessage defaultMessage="How often to create backups (minimum 1 day)" id="Backup Settings / Interval Description" />
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retention-days">
                        <FormattedMessage defaultMessage="Retention Period (days)" id="Backup Settings / Retention Label" />
                      </Label>
                      <Input
                        id="retention-days"
                        type="number"
                        min="1"
                        value={String(retentionDays)}
                        onChange={(e) => setRetentionDays(parseInt(e.target.value, 10) || 1)}
                        disabled={updating}
                      />
                      <p className="text-sm text-muted-foreground">
                        <FormattedMessage defaultMessage="How long to keep backup files (minimum 1 day)" id="Backup Settings / Retention Description" />
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        <FormattedMessage defaultMessage="Backup Modules" id="Backup Settings / Modules Label" />
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        <FormattedMessage
                          defaultMessage="All modules are included by default. Uncheck modules to exclude them from backups."
                          id="Backup Settings / Modules Description"
                        />
                      </p>
                      {modulesLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="space-y-2 rounded-md border p-3">
                          {modulesData?.availableBackupModules?.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              <FormattedMessage defaultMessage="No modules available" id="Backup Settings / No Modules" />
                            </p>
                          ) : (
                            modulesData?.availableBackupModules?.map((module: any) => {
                              const isIncluded = selectedModules.length === 0 || selectedModules.includes(module.id);
                              const isExpanded = expandedModules.has(module.id);
                              return (
                                <div key={module.id} className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id={`module-${module.id}`}
                                      checked={isIncluded}
                                      onCheckedChange={(checked) => {
                                        const allModuleIds = modulesData?.availableBackupModules?.map((m: any) => m.id) || [];
                                        if (checked) {
                                          const newSelected = [...selectedModules, module.id];
                                          if (newSelected.length === allModuleIds.length) setSelectedModules([]);
                                          else setSelectedModules(newSelected);
                                        } else {
                                          const otherModules = allModuleIds.filter((id: string) => id !== module.id);
                                          setSelectedModules(otherModules);
                                          setSelectedModels(selectedModels.filter((model) => !model.startsWith(module.id + '.')));
                                        }
                                      }}
                                      disabled={updating}
                                    />
                                    <div className="flex-1 flex items-center justify-between">
                                      <Label htmlFor={`module-${module.id}`} className="flex-1 cursor-pointer font-normal">
                                        <div>
                                          <span className="font-medium">{module.name}</span>
                                          <span className="ml-2 text-xs text-muted-foreground">
                                            ({module.modelCount} {module.modelCount === 1 ? 'model' : 'models'})
                                          </span>
                                        </div>
                                        {module.description && <p className="text-xs text-muted-foreground mt-0.5">{module.description}</p>}
                                      </Label>
                                      {module.modelCount > 0 && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            const newExpanded = new Set(expandedModules);
                                            if (isExpanded) newExpanded.delete(module.id);
                                            else newExpanded.add(module.id);
                                            setExpandedModules(newExpanded);
                                          }}
                                          className="ml-2 text-muted-foreground hover:text-foreground"
                                        >
                                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  {isExpanded && isIncluded && (
                                    <ModuleModelsList
                                      moduleId={module.id}
                                      excludedModels={excludedModels}
                                      onExcludedModelsChange={setExcludedModels}
                                      updating={updating}
                                    />
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        <FormattedMessage defaultMessage="Email Recipients" id="Backup Settings / Email Recipients Label" />
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        <FormattedMessage
                          defaultMessage="Select users to receive email notifications when backups are ready"
                          id="Backup Settings / Email Recipients Description"
                        />
                      </p>
                      <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                        {members.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            <FormattedMessage defaultMessage="No users available" id="Backup Settings / No Users" />
                          </p>
                        ) : (
                          members.map((membership) => {
                            if (!membership) return null;
                            const userId = membership.userId ? String(membership.userId) : null;
                            if (!userId) return null;
                            const displayName =
                              membership.firstName && membership.lastName
                                ? `${membership.firstName} ${membership.lastName}`
                                : membership.userEmail || '';
                            return (
                              <div key={userId} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`user-${userId}`}
                                  checked={selectedUserIds.includes(userId)}
                                  onCheckedChange={() => toggleUser(userId)}
                                  disabled={updating}
                                />
                                <Label htmlFor={`user-${userId}`} className="flex-1 cursor-pointer text-sm font-normal">
                                  {displayName}
                                </Label>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <Button onClick={handleSave} disabled={updating}>
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <FormattedMessage defaultMessage="Saving..." id="Backup Settings / Saving" />
                        </>
                      ) : (
                        <FormattedMessage defaultMessage="Save Settings" id="Backup Settings / Save Button" />
                      )}
                    </Button>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  <FormattedMessage defaultMessage="Backup History" id="Backup Settings / History Title" />
                </CardTitle>
                <CardDescription>
                  <FormattedMessage defaultMessage="View and manage your backup files" id="Backup Settings / History Description" />
                </CardDescription>
              </div>
              <Button onClick={handleTriggerBackup} disabled={triggering || !enabled} variant="outline">
                {triggering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <FormattedMessage defaultMessage="Triggering..." id="Backup Settings / Triggering" />
                  </>
                ) : (
                  <>
                    <FileArchive className="mr-2 h-4 w-4" />
                    <FormattedMessage defaultMessage="Trigger Backup" id="Backup Settings / Trigger Button" />
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recordsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : backupRecords.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                <FormattedMessage defaultMessage="No backups yet" id="Backup Settings / No Backups" />
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><FormattedMessage defaultMessage="Date" id="Backup Settings / Table Date" /></TableHead>
                    <TableHead><FormattedMessage defaultMessage="Size" id="Backup Settings / Table Size" /></TableHead>
                    <TableHead><FormattedMessage defaultMessage="Status" id="Backup Settings / Table Status" /></TableHead>
                    <TableHead><FormattedMessage defaultMessage="Actions" id="Backup Settings / Table Actions" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupRecords.map((backup) => {
                    const date = backup?.createdAt && typeof backup.createdAt === 'string' ? new Date(backup.createdAt).toLocaleString(intl.locale) : '-';
                    const size = formatFileSize(backup?.fileSize);
                    const status = backup?.status ?? 'UNKNOWN';
                    const isStickyProcessing = backup?.id ? processingBackupIdsRef.current.has(backup.id) : false;
                    const effectiveStatus = isStickyProcessing ? BackupBackupRecordStatusChoices.PROCESSING : status;
                    const isEncrypted = backup?.isEncrypted ?? false;
                    return (
                      <TableRow key={backup?.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isEncrypted && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                            <span>{date}</span>
                          </div>
                        </TableCell>
                        <TableCell>{size}</TableCell>
                        <TableCell>
                          <BackupStatusBadge status={String(effectiveStatus)} small />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {backup?.id && effectiveStatus === BackupBackupRecordStatusChoices.COMPLETED && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadBackup({ variables: { backupId: backup.id } })}
                                  disabled={downloading}
                                  title={intl.formatMessage({ defaultMessage: 'Download backup', id: 'Backup Settings / Download Tooltip' })}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenRestoreDialog(backup.id)}
                                  disabled={restoring}
                                  title={intl.formatMessage({ defaultMessage: 'Restore from this backup', id: 'Backup Settings / Restore Tooltip' })}
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline" onClick={() => backup?.id && handleDeleteBackup(backup.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  <FormattedMessage defaultMessage="Restore History" id="Backup Settings / Restore History Title" />
                </CardTitle>
                <CardDescription>
                  <FormattedMessage defaultMessage="View the history of backup restorations" id="Backup Settings / Restore History Description" />
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {restoreLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : restoreRecords.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                <FormattedMessage defaultMessage="No restorations yet" id="Backup Settings / No Restorations" />
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><FormattedMessage defaultMessage="Date" id="Backup Settings / Restore Table Date" /></TableHead>
                    <TableHead><FormattedMessage defaultMessage="Strategy" id="Backup Settings / Restore Table Strategy" /></TableHead>
                    <TableHead><FormattedMessage defaultMessage="Status" id="Backup Settings / Restore Table Status" /></TableHead>
                    <TableHead><FormattedMessage defaultMessage="Results" id="Backup Settings / Restore Table Results" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restoreRecords.map((restore: any) => {
                    const date = restore?.createdAt && typeof restore.createdAt === 'string' ? new Date(restore.createdAt).toLocaleString(intl.locale) : '-';
                    const strategy = String(restore?.conflictStrategy || '-');
                    const status = restore?.status ?? 'UNKNOWN';
                    return (
                      <TableRow key={restore?.id}>
                        <TableCell>{date}</TableCell>
                        <TableCell>
                          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{strategy}</span>
                        </TableCell>
                        <TableCell>
                          <BackupStatusBadge status={String(status)} formatLabel={(s) => s.replace(/_/g, ' ')} small />
                        </TableCell>
                        <TableCell>
                          {(status === BackupRestoreRecordStatusChoices.COMPLETED ||
                            status === BackupRestoreRecordStatusChoices.PARTIALLY_COMPLETED) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex flex-wrap gap-2 text-xs cursor-help">
                                      {restore?.totalCreated > 0 && (
                                        <span className="text-green-600">
                                          <FormattedMessage defaultMessage="{count} created" id="Backup Settings / Restore Created Count" values={{ count: restore.totalCreated }} />
                                        </span>
                                      )}
                                      {restore?.totalUpdated > 0 && (
                                        <span className="text-blue-600">
                                          <FormattedMessage defaultMessage="{count} updated" id="Backup Settings / Restore Updated Count" values={{ count: restore.totalUpdated }} />
                                        </span>
                                      )}
                                      {restore?.totalSkipped > 0 && (
                                        <span className="text-muted-foreground">
                                          <FormattedMessage defaultMessage="{count} skipped" id="Backup Settings / Restore Skipped Count" values={{ count: restore.totalSkipped }} />
                                        </span>
                                      )}
                                      {restore?.totalFailed > 0 && (
                                        <span className="text-red-600">
                                          <FormattedMessage defaultMessage="{count} failed" id="Backup Settings / Restore Failed Count" values={{ count: restore.totalFailed }} />
                                        </span>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-md">
                                    <div className="space-y-2">
                                      <div className="font-semibold text-sm border-b border-border pb-1">
                                        <FormattedMessage defaultMessage="Detailed Results by Model" id="Backup Settings / Restore Tooltip Title" />
                                      </div>
                                      {formatModelCountsForTooltip(restore?.modelCounts) || (
                                        <div className="text-xs text-muted-foreground">
                                          <FormattedMessage defaultMessage="No detailed information available" id="Backup Settings / Restore Tooltip No Data" />
                                        </div>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          {status === BackupRestoreRecordStatusChoices.FAILED && restore?.errorMessage && (
                            <span className="text-xs text-red-600">{restore.errorMessage}</span>
                          )}
                          {status === BackupRestoreRecordStatusChoices.PROCESSING && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <FormattedMessage defaultMessage="Restore Backup" id="Backup Settings / Restore Dialog Title" />
            </DialogTitle>
            <DialogDescription>
              <FormattedMessage defaultMessage="Choose how to handle records that already exist in your data." id="Backup Settings / Restore Dialog Description" />
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={conflictStrategy} onValueChange={(value) => setConflictStrategy(value as ConflictStrategyEnum)} className="space-y-3">
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value={ConflictStrategyEnum.SKIP} id="strategy-skip" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="strategy-skip" className="cursor-pointer font-medium">
                    <FormattedMessage defaultMessage="Skip existing" id="Backup Settings / Strategy Skip Label" />
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage defaultMessage="If a record already exists, keep the current version and skip the backup copy. This is the safest option." id="Backup Settings / Strategy Skip Description" />
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value={ConflictStrategyEnum.UPDATE} id="strategy-update" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="strategy-update" className="cursor-pointer font-medium">
                    <FormattedMessage defaultMessage="Update existing" id="Backup Settings / Strategy Update Label" />
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage defaultMessage="If a record already exists, overwrite it with the backup version. New records will also be created." id="Backup Settings / Strategy Update Description" />
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value={ConflictStrategyEnum.FAIL} id="strategy-fail" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="strategy-fail" className="cursor-pointer font-medium">
                    <FormattedMessage defaultMessage="Fail on conflicts" id="Backup Settings / Strategy Fail Label" />
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage defaultMessage="If any record already exists, abort the entire restoration. No changes will be made. This is the strictest option." id="Backup Settings / Strategy Fail Description" />
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
          <Alert variant="destructive">
            <AlertDescription>
              <FormattedMessage defaultMessage="Restoring a backup will modify your data. Make sure you understand the chosen conflict strategy before proceeding." id="Backup Settings / Restore Warning" />
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)} disabled={restoring}>
              <FormattedMessage defaultMessage="Cancel" id="Backup Settings / Restore Cancel" />
            </Button>
            <Button onClick={handleRestore} disabled={restoring}>
              {restoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <FormattedMessage defaultMessage="Restoring..." id="Backup Settings / Restoring" />
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  <FormattedMessage defaultMessage="Start Restore" id="Backup Settings / Start Restore Button" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
};
