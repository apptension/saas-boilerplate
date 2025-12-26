import { apiClient } from '@sb/webapp-api-client/api';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { Button } from '@sb/webapp-core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Input } from '@sb/webapp-core/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sb/webapp-core/components/ui/select';
import { cn } from '@sb/webapp-core/lib/utils';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Filter,
  Fingerprint,
  Loader2,
  LogIn,
  LogOut,
  Monitor,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Smartphone,
  User,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { useCurrentTenant } from '../../../../providers';

interface AuditLog {
  id: string;
  eventType: string;
  eventDescription: string;
  userEmail: string | null;
  connectionName: string | null;
  ipAddress: string | null;
  userAgent: string;
  success: boolean;
  errorMessage: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface AuditLogResponse {
  logs: AuditLog[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  hasPrevious: boolean;
  eventTypes?: string[];
  userEmails?: string[];
}

interface Filters {
  eventType: string;
  userEmail: string;
  success: string;
  startDate: string;
  endDate: string;
  search: string;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  // SSO events
  sso_login_initiated: <LogIn className="h-4 w-4" />,
  sso_login_success: <LogIn className="h-4 w-4" />,
  sso_login_failed: <X className="h-4 w-4" />,
  sso_logout: <LogOut className="h-4 w-4" />,

  // Config events
  idp_config_created: <Settings className="h-4 w-4" />,
  idp_config_updated: <Settings className="h-4 w-4" />,
  idp_config_deleted: <Settings className="h-4 w-4" />,
  idp_config_activated: <Check className="h-4 w-4" />,
  idp_config_deactivated: <X className="h-4 w-4" />,

  // Provisioning events
  user_provisioned: <User className="h-4 w-4" />,
  user_updated: <User className="h-4 w-4" />,
  group_mapping_applied: <Users className="h-4 w-4" />,

  // SCIM events
  scim_user_created: <User className="h-4 w-4" />,
  scim_user_updated: <User className="h-4 w-4" />,
  scim_user_deleted: <User className="h-4 w-4" />,
  scim_group_created: <Users className="h-4 w-4" />,
  scim_group_updated: <Users className="h-4 w-4" />,
  scim_group_deleted: <Users className="h-4 w-4" />,

  // Session events
  session_created: <Monitor className="h-4 w-4" />,
  session_revoked: <LogOut className="h-4 w-4" />,

  // Device events
  device_registered: <Smartphone className="h-4 w-4" />,
  device_removed: <Smartphone className="h-4 w-4" />,

  // Passkey events
  passkey_registered: <Fingerprint className="h-4 w-4" />,
  passkey_removed: <Fingerprint className="h-4 w-4" />,
  passkey_auth_success: <Fingerprint className="h-4 w-4" />,
  passkey_auth_failed: <Fingerprint className="h-4 w-4" />,
};

const getEventIcon = (eventType: string) => {
  return EVENT_ICONS[eventType] || <Shield className="h-4 w-4" />;
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  sso_login_initiated: 'SSO Login Initiated',
  sso_login_success: 'SSO Login Success',
  sso_login_failed: 'SSO Login Failed',
  sso_logout: 'SSO Logout',
  idp_config_created: 'SSO Connection Created',
  idp_config_updated: 'SSO Connection Updated',
  idp_config_deleted: 'SSO Connection Deleted',
  idp_config_activated: 'SSO Connection Activated',
  idp_config_deactivated: 'SSO Connection Deactivated',
  user_provisioned: 'User Provisioned (JIT)',
  user_updated: 'User Updated (SSO)',
  group_mapping_applied: 'Group Mapping Applied',
  scim_user_created: 'SCIM User Created',
  scim_user_updated: 'SCIM User Updated',
  scim_user_deleted: 'SCIM User Deleted',
  scim_group_created: 'SCIM Group Created',
  scim_group_updated: 'SCIM Group Updated',
  scim_group_deleted: 'SCIM Group Deleted',
  session_created: 'Session Created',
  session_revoked: 'Session Revoked',
  device_registered: 'Device Registered',
  device_removed: 'Device Removed',
  passkey_registered: 'Passkey Registered',
  passkey_removed: 'Passkey Removed',
  passkey_auth_success: 'Passkey Auth Success',
  passkey_auth_failed: 'Passkey Auth Failed',
};

const getEventLabel = (eventType: string): string => {
  return EVENT_TYPE_LABELS[eventType] || eventType;
};

const DEFAULT_PAGE_SIZE = 20;

export const AuditLogCard = () => {
  const intl = useIntl();
  const { data: currentTenant } = useCurrentTenant();
  const tenantId = currentTenant?.id;

  // State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const hasLoadedOnce = useRef(false);

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    eventType: '',
    userEmail: '',
    success: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  // Available filter options
  const [filterOptions, setFilterOptions] = useState<{
    eventTypes: string[];
    userEmails: string[];
  }>({
    eventTypes: Object.keys(EVENT_TYPE_LABELS),
    userEmails: [],
  });

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((v) => v !== '');
  }, [filters]);

  const buildQueryParams = useCallback(
    (page: number, includeFilterOptions = false) => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(DEFAULT_PAGE_SIZE));

      if (filters.eventType) params.set('event_type', filters.eventType);
      if (filters.userEmail) params.set('user_email', filters.userEmail);
      if (filters.success) params.set('success', filters.success);
      if (filters.startDate) params.set('start_date', filters.startDate);
      if (filters.endDate) params.set('end_date', filters.endDate);
      if (filters.search) params.set('search', filters.search);
      if (includeFilterOptions) params.set('include_filter_options', 'true');

      return params.toString();
    },
    [filters]
  );

  const fetchLogs = useCallback(
    async (page = 1, fetchFilterOptions = false) => {
      if (!tenantId) {
        setInitialLoading(false);
        return;
      }

      // Only show initial loading spinner on first load
      if (!hasLoadedOnce.current) {
        setInitialLoading(true);
      } else {
        setIsFetching(true);
      }

      try {
        const queryParams = buildQueryParams(page, fetchFilterOptions);
        const response = await apiClient.get<AuditLogResponse>(
          `/api/sso/tenant/${tenantId}/audit-logs/?${queryParams}`
        );
        setLogs(response.data.logs || []);
        setTotalCount(response.data.totalCount || 0);
        setTotalPages(response.data.totalPages || 0);
        setCurrentPage(response.data.currentPage || 1);
        hasLoadedOnce.current = true;

        if (fetchFilterOptions && response.data.userEmails) {
          setFilterOptions((prev) => ({
            ...prev,
            userEmails: response.data.userEmails || [],
          }));
        }
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      } finally {
        setInitialLoading(false);
        setIsFetching(false);
      }
    },
    [tenantId, buildQueryParams]
  );

  useEffect(() => {
    // Fetch with filter options on initial load
    fetchLogs(1, true);
  }, [fetchLogs]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchLogs(page);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchLogs(1);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      eventType: '',
      userEmail: '',
      success: '',
      startDate: '',
      endDate: '',
      search: '',
    };
    setFilters(clearedFilters);
    // Need to fetch with cleared filters
    setTimeout(() => fetchLogs(1), 0);
  };

  const handleRefresh = () => {
    fetchLogs(currentPage);
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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5; // Number of page buttons to show

    if (totalPages <= showPages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= Math.min(showPages, totalPages - 1); i++) {
          pages.push(i);
        }
        if (totalPages > showPages) {
          pages.push('ellipsis');
        }
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('ellipsis');
        for (let i = totalPages - showPages + 1; i < totalPages; i++) {
          if (i > 1) pages.push(i);
        }
      } else {
        // In the middle
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <FormattedMessage
                defaultMessage="Security Audit Log"
                id="Tenant Security Settings / Audit Header"
              />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="View recent security events for your organization"
                id="Tenant Security Settings / Audit Description"
              />
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn('gap-2', hasActiveFilters && 'text-primary')}
            >
              <Filter className="h-4 w-4" />
              <FormattedMessage defaultMessage="Filters" id="Audit / Filters button" />
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs">
                  {Object.values(filters).filter((v) => v !== '').length}
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isFetching}
              className="h-8 w-8"
            >
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 rounded-lg border bg-muted/30 p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  <FormattedMessage defaultMessage="Search" id="Audit / Filter Search" />
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={intl.formatMessage({
                      defaultMessage: 'Search logs...',
                      id: 'Audit / Search placeholder',
                    })}
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Event Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  <FormattedMessage defaultMessage="Event Type" id="Audit / Filter Event Type" />
                </label>
                <Select
                  value={filters.eventType}
                  onValueChange={(value) => handleFilterChange('eventType', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={intl.formatMessage({
                        defaultMessage: 'All events',
                        id: 'Audit / All events placeholder',
                      })}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <FormattedMessage defaultMessage="All events" id="Audit / All events" />
                    </SelectItem>
                    {filterOptions.eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getEventLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  <FormattedMessage defaultMessage="User" id="Audit / Filter User" />
                </label>
                <Input
                  placeholder={intl.formatMessage({
                    defaultMessage: 'Filter by email...',
                    id: 'Audit / User email placeholder',
                  })}
                  value={filters.userEmail}
                  onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  <FormattedMessage defaultMessage="Status" id="Audit / Filter Status" />
                </label>
                <Select
                  value={filters.success}
                  onValueChange={(value) => handleFilterChange('success', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={intl.formatMessage({
                        defaultMessage: 'All statuses',
                        id: 'Audit / All statuses placeholder',
                      })}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <FormattedMessage defaultMessage="All statuses" id="Audit / All statuses" />
                    </SelectItem>
                    <SelectItem value="true">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <FormattedMessage defaultMessage="Success" id="Audit / Status Success" />
                      </div>
                    </SelectItem>
                    <SelectItem value="false">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-destructive" />
                        <FormattedMessage defaultMessage="Failed" id="Audit / Status Failed" />
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  <FormattedMessage defaultMessage="From Date" id="Audit / Filter Start Date" />
                </label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  <FormattedMessage defaultMessage="To Date" id="Audit / Filter End Date" />
                </label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  defaultMessage="{count, plural, =0 {No events found} one {# event found} other {# events found}}"
                  id="Audit / Results count"
                  values={{ count: totalCount }}
                />
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters || isFetching}
                >
                  <FormattedMessage defaultMessage="Clear filters" id="Audit / Clear filters" />
                </Button>
                <Button size="sm" onClick={handleApplyFilters} disabled={isFetching}>
                  {isFetching ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  <FormattedMessage defaultMessage="Apply filters" id="Audit / Apply filters" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {initialLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
            <Shield className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters ? (
                <FormattedMessage
                  defaultMessage="No events match your filters"
                  id="Tenant Security Settings / No Filtered Audit Events"
                />
              ) : (
                <FormattedMessage
                  defaultMessage="No security events found"
                  id="Tenant Security Settings / No Audit Events"
                />
              )}
            </p>
            {hasActiveFilters && (
              <Button variant="link" size="sm" onClick={handleClearFilters} className="mt-2">
                <FormattedMessage defaultMessage="Clear filters" id="Audit / Clear filters link" />
              </Button>
            )}
          </div>
        ) : (
          <div className="relative space-y-4">
            {/* Subtle loading overlay for fetching */}
            {isFetching && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-background/50 pt-8">
                <div className="flex items-center gap-2 rounded-full bg-background px-3 py-1.5 shadow-md">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    <FormattedMessage defaultMessage="Loading..." id="Audit / Loading indicator" />
                  </span>
                </div>
              </div>
            )}

            {/* Logs List */}
            <div className={cn('space-y-2', isFetching && 'opacity-60')}>
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    'rounded-lg border p-3 transition-colors',
                    log.success ? 'bg-card hover:bg-muted/30' : 'border-destructive/30 bg-destructive/5'
                  )}
                >
                  <div
                    className="flex cursor-pointer items-center justify-between"
                    onClick={() => toggleLogExpand(log.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full',
                          log.success ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                        )}
                      >
                        {log.success ? getEventIcon(log.eventType) : <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{getEventLabel(log.eventType)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(log.createdAt)}
                          {log.userEmail && ` • ${log.userEmail}`}
                          {log.ipAddress && ` • ${log.ipAddress}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!log.success && (
                        <Badge variant="destructive" className="text-xs">
                          <FormattedMessage defaultMessage="Failed" id="Audit / Failed badge" />
                        </Badge>
                      )}
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                        {expandedLogId === log.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {expandedLogId === log.id && (
                    <div className="mt-3 border-t pt-3">
                      <dl className="grid grid-cols-2 gap-2 text-xs">
                        {log.eventDescription && (
                          <div className="col-span-2">
                            <dt className="font-medium text-muted-foreground">
                              <FormattedMessage defaultMessage="Description" id="Audit / Description" />
                            </dt>
                            <dd className="mt-0.5">{log.eventDescription}</dd>
                          </div>
                        )}
                        {log.connectionName && (
                          <div>
                            <dt className="font-medium text-muted-foreground">
                              <FormattedMessage defaultMessage="SSO Connection" id="Audit / Connection" />
                            </dt>
                            <dd className="mt-0.5">{log.connectionName}</dd>
                          </div>
                        )}
                        {log.ipAddress && (
                          <div>
                            <dt className="font-medium text-muted-foreground">
                              <FormattedMessage defaultMessage="IP Address" id="Audit / IP Address" />
                            </dt>
                            <dd className="mt-0.5 font-mono">{log.ipAddress}</dd>
                          </div>
                        )}
                        {log.errorMessage && (
                          <div className="col-span-2">
                            <dt className="font-medium text-destructive">
                              <FormattedMessage defaultMessage="Error" id="Audit / Error" />
                            </dt>
                            <dd className="mt-0.5 text-destructive">{log.errorMessage}</dd>
                          </div>
                        )}
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="col-span-2">
                            <dt className="font-medium text-muted-foreground">
                              <FormattedMessage defaultMessage="Details" id="Audit / Details" />
                            </dt>
                            <dd className="mt-0.5 rounded bg-muted p-2 font-mono text-xs">
                              {JSON.stringify(log.metadata, null, 2)}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={cn('flex items-center justify-between border-t pt-4', isFetching && 'opacity-60')}>
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage
                    defaultMessage="Showing {start}-{end} of {total} events"
                    id="Audit / Pagination summary"
                    values={{
                      start: ((currentPage - 1) * DEFAULT_PAGE_SIZE + 1).toLocaleString(),
                      end: Math.min(currentPage * DEFAULT_PAGE_SIZE, totalCount).toLocaleString(),
                      total: totalCount.toLocaleString(),
                    }}
                  />
                </p>
                <div className="flex items-center gap-1">
                  {/* First page */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1 || isFetching}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>

                  {/* Previous page */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isFetching}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) =>
                      page === 'ellipsis' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'ghost'}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePageChange(page)}
                          disabled={isFetching}
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>

                  {/* Next page */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isFetching}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Last page */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages || isFetching}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
