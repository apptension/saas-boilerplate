import { useMutation, useQuery } from '@apollo/client/react';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { Button } from '@sb/webapp-core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Input } from '@sb/webapp-core/components/ui/input';
import { DatePicker } from '@sb/webapp-core/components/ui/datePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sb/webapp-core/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@sb/webapp-core/components/ui/tooltip';
import { useToast } from '@sb/webapp-core/toast';
import { cn } from '@sb/webapp-core/lib/utils';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Download,
  Edit,
  Filter,
  History,
  Import,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  User,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { getFragmentData } from '@sb/webapp-api-client/graphql';

import { usePermissionCheck } from '../../../../hooks';
import { useCurrentTenant } from '../../../../providers';
import { actionLogFragment, allActionLogsQuery, exportActionLogsMutation } from '../tenantActivityLogs.graphql';

interface Filters {
  entityType: string;
  actionType: string;
  actorEmail: string;
  fromDatetime: string;
  toDatetime: string;
  search: string;
}

const ACTION_TYPE_ICONS: Record<string, React.ReactNode> = {
  CREATE: <Plus className="h-4 w-4" />,
  UPDATE: <Edit className="h-4 w-4" />,
  DELETE: <Trash2 className="h-4 w-4" />,
  SETTINGS_CHANGE: <Settings className="h-4 w-4" />,
  IMPORT: <Import className="h-4 w-4" />,
  SYNC: <RefreshCw className="h-4 w-4" />,
  BULK_DELETE: <Trash2 className="h-4 w-4" />,
};

const ACTION_TYPE_LABELS: Record<string, string> = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  SETTINGS_CHANGE: 'Settings Changed',
  IMPORT: 'Imported',
  SYNC: 'Synced',
  BULK_DELETE: 'Bulk Deleted',
};

const ACTION_TYPE_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  UPDATE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  DELETE: 'bg-red-500/10 text-red-600 dark:text-red-400',
  SETTINGS_CHANGE: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  IMPORT: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  SYNC: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  BULK_DELETE: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  client: 'Client',
  project: 'Project',
  person: 'Person',
  role: 'Role',
  revenue_line: 'Revenue',
  cost_line: 'Cost',
  fx_rate: 'FX Rate',
  assignment: 'Assignment',
  iteration: 'Iteration',
  invoice: 'Invoice',
  deal: 'Deal',
  settings: 'Settings',
  tenant_settings: 'Tenant Settings',
};

const getEntityLabel = (entityType: string): string => {
  return ENTITY_TYPE_LABELS[entityType] || entityType;
};

const getActionIcon = (actionType: string) => {
  return ACTION_TYPE_ICONS[actionType] || <Zap className="h-4 w-4" />;
};

const getActionLabel = (actionType: string): string => {
  return ACTION_TYPE_LABELS[actionType] || actionType;
};

const DEFAULT_PAGE_SIZE = 20;

export const ActionLogCard = () => {
  const intl = useIntl();
  const { data: currentTenant } = useCurrentTenant();
  const tenantId = currentTenant?.id;
  const isLoggingEnabled = currentTenant?.actionLoggingEnabled ?? false;

  // Permission check for export
  const { hasPermission: canExport } = usePermissionCheck('security.logs.export');

  // State
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    entityType: '',
    actionType: '',
    actorEmail: '',
    fromDatetime: '',
    toDatetime: '',
    search: '',
  });

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((v) => v !== '');
  }, [filters]);

  // Convert local datetime string to ISO format for GraphQL
  const toISODatetime = (localDatetime: string) => {
    if (!localDatetime) return undefined;
    return new Date(localDatetime).toISOString();
  };

  const { toast } = useToast();
  const [exportLogs, { loading: exportLoading }] = useMutation(exportActionLogsMutation);

  const { data, loading, refetch, fetchMore } = useQuery(allActionLogsQuery, {
    variables: {
      tenantId: tenantId || '',
      first: DEFAULT_PAGE_SIZE,
      after: null,
      entityType: filters.entityType || undefined,
      actionType: filters.actionType || undefined,
      actorEmail: filters.actorEmail || undefined,
      fromDatetime: toISODatetime(filters.fromDatetime),
      toDatetime: toISODatetime(filters.toDatetime),
      search: filters.search || undefined,
    },
    skip: !tenantId,
    fetchPolicy: 'cache-and-network',
  });

  const logs = data?.allActionLogs?.edges
    ?.map((edge) => edge?.node ? getFragmentData(actionLogFragment, edge.node) : null)
    .filter((log): log is NonNullable<typeof log> => log !== null) || [];
  const totalCount = data?.allActionLogs?.totalCount || 0;
  const hasNextPage = data?.allActionLogs?.pageInfo?.hasNextPage || false;
  const endCursor = data?.allActionLogs?.pageInfo?.endCursor || null;

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    refetch({
      tenantId: tenantId || '',
      first: DEFAULT_PAGE_SIZE,
      after: null,
      entityType: filters.entityType || undefined,
      actionType: filters.actionType || undefined,
      actorEmail: filters.actorEmail || undefined,
      fromDatetime: toISODatetime(filters.fromDatetime),
      toDatetime: toISODatetime(filters.toDatetime),
      search: filters.search || undefined,
    });
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      entityType: '',
      actionType: '',
      actorEmail: '',
      fromDatetime: '',
      toDatetime: '',
      search: '',
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    refetch({
      tenantId: tenantId || '',
      first: DEFAULT_PAGE_SIZE,
      after: null,
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    if (hasNextPage && endCursor) {
      fetchMore({
        variables: {
          after: endCursor,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          return {
            allActionLogs: {
              ...fetchMoreResult.allActionLogs,
              edges: [...(previousResult.allActionLogs?.edges || []), ...(fetchMoreResult.allActionLogs?.edges || [])],
              pageInfo: fetchMoreResult.allActionLogs?.pageInfo ?? { hasNextPage: false, endCursor: null },
            },
          };
        },
      });
    }
  };

  const handleExport = async () => {
    if (!tenantId) return;

    try {
      const result = await exportLogs({
        variables: {
          tenantId,
          entityType: filters.entityType || undefined,
          actionType: filters.actionType || undefined,
          actorEmail: filters.actorEmail || undefined,
          fromDatetime: toISODatetime(filters.fromDatetime),
          toDatetime: toISODatetime(filters.toDatetime),
          search: filters.search || undefined,
        },
      });

      if (result.data?.exportActionLogs?.ok) {
        toast({
          title: intl.formatMessage({
            defaultMessage: 'Export started',
            id: 'Activity Logs / Export Started Title',
          }),
          description: intl.formatMessage({
            defaultMessage: "We're preparing your export. You'll receive a notification when it's ready to download.",
            id: 'Activity Logs / Export Started Description',
          }),
        });
      }
    } catch (error) {
      toast({
        title: intl.formatMessage({
          defaultMessage: 'Export failed',
          id: 'Activity Logs / Export Failed Title',
        }),
        description: intl.formatMessage({
          defaultMessage: 'There was an error starting the export. Please try again.',
          id: 'Activity Logs / Export Failed Description',
        }),
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const toggleLogExpand = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  const renderChanges = (changes: Record<string, { old: unknown; new: unknown }>) => {
    if (!changes || Object.keys(changes).length === 0) {
      return null;
    }

    return (
      <div className="space-y-2">
        {Object.entries(changes).map(([field, change]) => (
          <div key={field} className="flex items-start gap-2 text-sm">
            <span className="font-medium text-muted-foreground min-w-[100px]">{field}:</span>
            <div className="flex items-center gap-2">
              {change.old !== null && change.old !== undefined && (
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400 line-through">
                  <ArrowDown className="h-3 w-3" />
                  {typeof change.old === 'object' ? JSON.stringify(change.old) : String(change.old)}
                </span>
              )}
              {change.new !== null && change.new !== undefined && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <ArrowUp className="h-3 w-3" />
                  {typeof change.new === 'object' ? JSON.stringify(change.new) : String(change.new)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isLoggingEnabled) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <History className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">
                <FormattedMessage defaultMessage="Activity Log" id="Activity Logs / Card Header" />
              </CardTitle>
              <CardDescription className="mt-0.5">
                <FormattedMessage
                  defaultMessage="View recent activity in your organization"
                  id="Activity Logs / Card Description"
                />
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
              <History className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-1">
              <FormattedMessage defaultMessage="Activity logging is disabled" id="Activity Logs / Disabled title" />
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              <FormattedMessage
                defaultMessage="Enable activity logging above to start tracking changes in your organization."
                id="Activity Logs / Disabled description"
              />
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  <FormattedMessage defaultMessage="Activity Log" id="Activity Logs / Card Header" />
                </CardTitle>
                <CardDescription className="mt-0.5">
                  <FormattedMessage
                    defaultMessage="View recent activity in your organization"
                    id="Activity Logs / Card Description"
                  />
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showFilters ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn('gap-2', hasActiveFilters && 'border-primary/50')}
                  >
                    <Filter className="h-4 w-4" />
                    <FormattedMessage defaultMessage="Filters" id="Activity Logs / Filters button" />
                    {hasActiveFilters && (
                      <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs">
                        {Object.values(filters).filter((v) => v !== '').length}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <FormattedMessage defaultMessage="Filter activity logs" id="Activity Logs / Filters Tooltip" />
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="h-9 w-9"
                  >
                    <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <FormattedMessage defaultMessage="Refresh" id="Activity Logs / Refresh Tooltip" />
                </TooltipContent>
              </Tooltip>
              {canExport && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      disabled={loading || exportLoading || totalCount === 0}
                      className="gap-2"
                    >
                      {exportLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <FormattedMessage defaultMessage="Export" id="Activity Logs / Export button" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <FormattedMessage
                      defaultMessage="Export logs matching current filters"
                      id="Activity Logs / Export Tooltip"
                    />
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 rounded-lg border bg-muted/10 p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Search */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    <FormattedMessage defaultMessage="Search" id="Activity Logs / Filter Search" />
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={intl.formatMessage({
                        defaultMessage: 'Search logs...',
                        id: 'Activity Logs / Search placeholder',
                      })}
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Action Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    <FormattedMessage defaultMessage="Action Type" id="Activity Logs / Filter Action Type" />
                  </label>
                  <Select
                    value={filters.actionType}
                    onValueChange={(value) => handleFilterChange('actionType', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={intl.formatMessage({
                          defaultMessage: 'All actions',
                          id: 'Activity Logs / All actions placeholder',
                        })}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <FormattedMessage defaultMessage="All actions" id="Activity Logs / All actions" />
                      </SelectItem>
                      {Object.entries(ACTION_TYPE_LABELS).map(([type, label]) => (
                        <SelectItem key={type} value={type}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Entity Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    <FormattedMessage defaultMessage="Entity Type" id="Activity Logs / Filter Entity Type" />
                  </label>
                  <Select
                    value={filters.entityType}
                    onValueChange={(value) => handleFilterChange('entityType', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={intl.formatMessage({
                          defaultMessage: 'All entities',
                          id: 'Activity Logs / All entities placeholder',
                        })}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <FormattedMessage defaultMessage="All entities" id="Activity Logs / All entities" />
                      </SelectItem>
                      {Object.entries(ENTITY_TYPE_LABELS).map(([type, label]) => (
                        <SelectItem key={type} value={type}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Actor Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    <FormattedMessage defaultMessage="User" id="Activity Logs / Filter User" />
                  </label>
                  <Input
                    placeholder={intl.formatMessage({
                      defaultMessage: 'Filter by email...',
                      id: 'Activity Logs / User email placeholder',
                    })}
                    value={filters.actorEmail}
                    onChange={(e) => handleFilterChange('actorEmail', e.target.value)}
                  />
                </div>

                {/* From Date/Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    <FormattedMessage defaultMessage="From" id="Activity Logs / Filter From DateTime" />
                  </label>
                  <DatePicker
                    value={filters.fromDatetime}
                    onChange={(value) => handleFilterChange('fromDatetime', value || '')}
                    placeholder={intl.formatMessage({
                      defaultMessage: 'Select start date and time',
                      id: 'Activity Logs / From Placeholder',
                    })}
                    showTime
                  />
                </div>

                {/* To Date/Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    <FormattedMessage defaultMessage="To" id="Activity Logs / Filter To DateTime" />
                  </label>
                  <DatePicker
                    value={filters.toDatetime}
                    onChange={(value) => handleFilterChange('toDatetime', value || '')}
                    placeholder={intl.formatMessage({
                      defaultMessage: 'Select end date and time',
                      id: 'Activity Logs / To Placeholder',
                    })}
                    showTime
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage
                    defaultMessage="{count, plural, =0 {No logs found} one {# log found} other {# logs found}}"
                    id="Activity Logs / Results count"
                    values={{ count: totalCount }}
                  />
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters || loading}
                  >
                    <FormattedMessage defaultMessage="Clear filters" id="Activity Logs / Clear filters" />
                  </Button>
                  <Button size="sm" onClick={handleApplyFilters} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    <FormattedMessage defaultMessage="Apply filters" id="Activity Logs / Apply filters" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <History className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1">
                {hasActiveFilters ? (
                  <FormattedMessage
                    defaultMessage="No logs match your filters"
                    id="Activity Logs / No Filtered Logs"
                  />
                ) : (
                  <FormattedMessage defaultMessage="No activity yet" id="Activity Logs / No Logs" />
                )}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                {hasActiveFilters ? (
                  <FormattedMessage
                    defaultMessage="Try adjusting your filters or clearing them to see all logs."
                    id="Activity Logs / No Filtered Logs Hint"
                  />
                ) : (
                  <FormattedMessage
                    defaultMessage="Activity logs will appear here when users make changes to your organization's data."
                    id="Activity Logs / No Logs Hint"
                  />
                )}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  <FormattedMessage defaultMessage="Clear filters" id="Activity Logs / Clear filters link" />
                </Button>
              )}
            </div>
          ) : (
            <div className="relative space-y-4">
              {/* Logs List */}
              <div className={cn('space-y-2', loading && 'opacity-60')}>
                {logs.map((log) => {
                  if (!log) return null;
                  const actionColor = ACTION_TYPE_COLORS[log.actionType] || 'bg-muted text-muted-foreground';
                  const isSystemAction = log.actorType !== 'USER';

                  return (
                    <div
                      key={log.id}
                      className={cn(
                        'group rounded-lg border p-4 transition-all',
                        'hover:shadow-sm hover:border-primary/20'
                      )}
                    >
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center justify-between text-left"
                        onClick={() => toggleLogExpand(log.id)}
                        aria-expanded={expandedLogId === log.id}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                              actionColor
                            )}
                          >
                            {getActionIcon(log.actionType)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {getActionLabel(log.actionType)} {getEntityLabel(log.entityType)}
                              </span>
                              {log.entityName && (
                                <span className="text-muted-foreground">"{log.entityName}"</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{formatDate(log.createdAt)}</span>
                              <span className="text-muted-foreground/50">•</span>
                              <span className="flex items-center gap-1">
                                {isSystemAction ? (
                                  <>
                                    <Zap className="h-3 w-3" />
                                    {log.actorType.replace('SYSTEM:', '')}
                                  </>
                                ) : (
                                  <>
                                    <User className="h-3 w-3" />
                                    {log.actorEmail || 'Unknown user'}
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-hidden
                        >
                          {expandedLogId === log.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      </button>

                      {expandedLogId === log.id && (
                        <div className="mt-4 border-t pt-4">
                          <dl className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <dt className="text-xs font-medium text-muted-foreground mb-1">
                                <FormattedMessage defaultMessage="Entity ID" id="Activity Logs / Entity ID" />
                              </dt>
                              <dd className="font-mono text-xs">{log.entityId}</dd>
                            </div>
                            <div>
                              <dt className="text-xs font-medium text-muted-foreground mb-1">
                                <FormattedMessage defaultMessage="Actor" id="Activity Logs / Actor" />
                              </dt>
                              <dd>
                                {isSystemAction ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {log.actorType}
                                  </Badge>
                                ) : (
                                  log.actorEmail
                                )}
                              </dd>
                            </div>
                            {log.changes && Object.keys(log.changes).length > 0 && (
                              <div className="col-span-2">
                                <dt className="text-xs font-medium text-muted-foreground mb-2">
                                  <FormattedMessage defaultMessage="Changes" id="Activity Logs / Changes" />
                                </dt>
                                <dd className="rounded-lg bg-muted/50 p-3">
                                  {renderChanges(log.changes as Record<string, { old: unknown; new: unknown }>)}
                                </dd>
                              </div>
                            )}
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <div className="col-span-2">
                                <dt className="text-xs font-medium text-muted-foreground mb-1">
                                  <FormattedMessage defaultMessage="Additional Details" id="Activity Logs / Details" />
                                </dt>
                                <dd className="rounded-lg bg-muted/50 p-3 font-mono text-xs overflow-auto">
                                  <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                                </dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Load More */}
              {hasNextPage && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    <FormattedMessage defaultMessage="Load more" id="Activity Logs / Load more" />
                  </Button>
                </div>
              )}

              {/* Summary */}
              <div className="flex items-center justify-center border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage
                    defaultMessage="Showing {count} of {total} logs"
                    id="Activity Logs / Summary"
                    values={{
                      count: logs.length,
                      total: totalCount,
                    }}
                  />
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
