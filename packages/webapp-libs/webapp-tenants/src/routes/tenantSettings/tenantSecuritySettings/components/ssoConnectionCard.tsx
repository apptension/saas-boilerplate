import { useState } from 'react';
import { Button } from '@sb/webapp-core/components/buttons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@sb/webapp-core/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@sb/webapp-core/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@sb/webapp-core/components/ui/tooltip';
import { Switch } from '@sb/webapp-core/components/ui/switch';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import { useOpenState } from '@sb/webapp-core/hooks';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { cn } from '@sb/webapp-core/lib/utils';
import {
  Shield,
  ShieldAlert,
  Link2,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Building2,
  KeyRound,
  MoreHorizontal,
  Power,
  PowerOff,
  Users,
  Calendar,
  Activity,
  FlaskConical,
  AlertTriangle,
  Info,
  Globe,
  Pencil,
} from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { useCurrentTenant } from '../../../../providers';
import { useTenantSSO } from '../../../../hooks/useTenantSSO';
import { AddSSOConnectionModal } from './addSSOConnectionModal';
import { EditSSOConnectionModal } from './editSSOConnectionModal';

type SSOConnection = {
  id: string;
  name: string;
  connectionType: string;
  status: string;
  isActive: boolean;
  isSaml: boolean;
  isOidc: boolean;
  allowedDomains: string[];
  enforceSso: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  loginCount: number;
  spMetadataUrl?: string | null;
  spAcsUrl?: string | null;
  spEntityId?: string | null;
  oidcCallbackUrl?: string | null;
  oidcLoginUrl?: string | null;
  samlEntityId?: string | null;
  samlSsoUrl?: string | null;
  oidcIssuer?: string | null;
  oidcClientId?: string | null;
};

type TestCheck = {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: Record<string, string | number>;
};

type TestResult = {
  connectionId: string;
  connectionName: string;
  connectionType: string;
  overallStatus: 'success' | 'warning' | 'error';
  checks: TestCheck[];
  testedAt: string;
};

export type SSOConnectionCardProps = {
  canManageSSO: boolean;
};

export const SSOConnectionCard = ({ canManageSSO }: SSOConnectionCardProps) => {
  const { isOpen: isModalOpen, setIsOpen: setIsModalOpen } = useOpenState(false);
  const { isOpen: isEditModalOpen, setIsOpen: setIsEditModalOpen } = useOpenState(false);
  const [editingConnection, setEditingConnection] = useState<SSOConnection | null>(null);
  const { isOpen: isTestDialogOpen, setIsOpen: setIsTestDialogOpen } = useOpenState(false);
  const { toast } = useToast();
  const intl = useIntl();
  const { data: currentTenant } = useCurrentTenant();
  const tenantId = currentTenant?.id;

  const {
    connections,
    loading,
    refetch,
    deleteConnection,
    activateConnection,
    deactivateConnection,
    updateConnection,
    testConnection,
  } = useTenantSSO(tenantId);


  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [togglingEnforceSSO, setTogglingEnforceSSO] = useState<string | null>(null);
  const [testingConnectionId, setTestingConnectionId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleDelete = async (connectionId: string) => {
    if (!tenantId) return;
    setDeleting(connectionId);
    try {
      await deleteConnection({ variables: { input: { id: connectionId, tenantId } } });
      toast({
        description: intl.formatMessage({
          defaultMessage: 'SSO connection deleted.',
          id: 'SSO Card / Delete Success',
        }),
        variant: 'success',
      });
      window.dispatchEvent(new CustomEvent('sso-connections-changed', { detail: { tenantId } }));
    } catch {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to delete SSO connection.',
          id: 'SSO Card / Delete Error',
        }),
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (connection: SSOConnection) => {
    if (!tenantId) return;
    setToggling(connection.id);
    try {
      if (connection.isActive) {
        await deactivateConnection({ variables: { id: connection.id, tenantId } });
        toast({
          description: intl.formatMessage({
            defaultMessage: 'SSO connection deactivated.',
            id: 'SSO Card / Deactivate Success',
          }),
          variant: 'success',
        });
      } else {
        await activateConnection({
          variables: { input: { id: connection.id, tenantId } },
        });
        toast({
          description: intl.formatMessage({
            defaultMessage: 'SSO connection activated.',
            id: 'SSO Card / Activate Success',
          }),
          variant: 'success',
        });
      }
      window.dispatchEvent(new CustomEvent('sso-connections-changed', { detail: { tenantId } }));
    } catch {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to update SSO connection.',
          id: 'SSO Card / Toggle Error',
        }),
        variant: 'destructive',
      });
    } finally {
      setToggling(null);
    }
  };

  const handleToggleEnforceSSO = async (connection: SSOConnection) => {
    if (!tenantId) return;
    setTogglingEnforceSSO(connection.id);
    try {
      await updateConnection({
        variables: {
          input: {
            id: connection.id,
            tenantId,
            name: connection.name,
            enforceSso: !connection.enforceSso,
          },
        },
      });
      toast({
        description: intl.formatMessage(
          connection.enforceSso
            ? {
                defaultMessage: 'SSO enforcement disabled. Users can now log in with password.',
                id: 'SSO Card / Enforce SSO Disabled',
              }
            : {
                defaultMessage: 'SSO enforcement enabled. Users from allowed domains must use SSO.',
                id: 'SSO Card / Enforce SSO Enabled',
              }
        ),
        variant: 'success',
      });
    } catch {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to update SSO enforcement setting.',
          id: 'SSO Card / Enforce SSO Error',
        }),
        variant: 'destructive',
      });
    } finally {
      setTogglingEnforceSSO(null);
    }
  };

  const handleTestConnection = async (connection: SSOConnection) => {
    setTestResult(null);
    setTestingConnectionId(connection.id);
    try {
      const result = await testConnection({ variables: { id: connection.id, tenantId } });
      const data = result.data?.testSsoConnection?.result;
      if (data) {
        const checks = (data.checks ?? [])
          .filter((c): c is NonNullable<typeof c> => c != null)
          .map((c) => ({
            name: c.name ?? '',
            status: (c.status ?? 'error') as 'success' | 'warning' | 'error',
            message: c.message ?? '',
            details: c.details != null ? (typeof c.details === 'object' && !Array.isArray(c.details) ? (c.details as Record<string, string | number>) : undefined) : undefined,
          }));
        setTestResult({
          connectionId: data.connectionId ?? '',
          connectionName: data.connectionName ?? '',
          connectionType: data.connectionType ?? '',
          overallStatus: (data.overallStatus ?? 'error') as 'success' | 'warning' | 'error',
          checks,
          testedAt: data.testedAt ?? '',
        });
        setIsTestDialogOpen(true);
      }
    } catch {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to test SSO connection.',
          id: 'SSO Card / Test Error',
        }),
        variant: 'destructive',
      });
    } finally {
      setTestingConnectionId(null);
    }
  };

  const getTestStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getOverallStatusBadge = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            <FormattedMessage defaultMessage="All checks passed" id="SSO Card / Test All Passed" />
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20">
            <AlertTriangle className="mr-1 h-3 w-3" />
            <FormattedMessage defaultMessage="Some warnings" id="SSO Card / Test Warnings" />
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20">
            <XCircle className="mr-1 h-3 w-3" />
            <FormattedMessage defaultMessage="Configuration issues" id="SSO Card / Test Errors" />
          </Badge>
        );
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
    }).format(new Date(dateStr));
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          <FormattedMessage defaultMessage="Active" id="SSO Card / Active Badge" />
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        <XCircle className="mr-1 h-3 w-3" />
        <FormattedMessage defaultMessage="Inactive" id="SSO Card / Inactive Badge" />
      </Badge>
    );
  };

  const getConnectionTypeBadge = (connection: SSOConnection) => {
    const isSaml = connection.isSaml || connection.connectionType.toLowerCase() === 'saml';
    return (
      <Badge variant="outline" className="font-mono text-xs">
        {isSaml ? 'SAML 2.0' : 'OIDC'}
      </Badge>
    );
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  <FormattedMessage
                    defaultMessage="Single Sign-On (SSO)"
                    id="Tenant Security Settings / SSO Header"
                  />
                </CardTitle>
                <CardDescription className="mt-0.5">
                  <FormattedMessage
                    defaultMessage="Configure SAML 2.0 or OIDC identity providers for your organization. Users from allowed domains are automatically provisioned on first sign-in."
                    id="Tenant Security Settings / SSO Description"
                  />
                </CardDescription>
              </div>
            </div>
            {canManageSSO && connections.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                <FormattedMessage
                  defaultMessage="Add Connection"
                  id="Tenant Security Settings / Add SSO Button"
                />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canManageSSO ? (
            <div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/30 p-6 text-center">
              <div className="space-y-2">
                <Shield className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage
                    defaultMessage="Only organization owners and admins can configure SSO"
                    id="Tenant Security Settings / SSO Permission"
                  />
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : connections.length === 0 ? (
            <div className="space-y-6">
              {/* Empty State */}
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Link2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-1">
                  <FormattedMessage
                    defaultMessage="No SSO connections configured"
                    id="Tenant Security Settings / No SSO"
                  />
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  <FormattedMessage
                    defaultMessage="Enable enterprise authentication by connecting your identity provider. Support for SAML 2.0 and OpenID Connect."
                    id="Tenant Security Settings / SSO Setup Hint"
                  />
                </p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    defaultMessage="Configure SSO"
                    id="Tenant Security Settings / Add SSO Button Empty"
                  />
                </Button>
              </div>

              {/* Automatic provisioning info */}
              <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
                <div className="flex gap-3">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                      <FormattedMessage
                        defaultMessage="Automatic user provisioning"
                        id="Tenant Security Settings / JIT Provisioning Title"
                      />
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      <FormattedMessage
                        defaultMessage="When enabled, users with email addresses from your allowed domains are automatically created and added to your organization when they sign in via SSO for the first time. No manual invitation required."
                        id="Tenant Security Settings / JIT Provisioning Description"
                      />
                    </p>
                  </div>
                </div>
              </div>

              {/* Supported Providers */}
              <div className="rounded-lg border bg-muted/10 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  <FormattedMessage
                    defaultMessage="Supported Identity Providers"
                    id="Tenant Security Settings / Supported IdPs"
                  />
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Okta', 'Azure AD', 'Google Workspace', 'OneLogin', 'Auth0', 'JumpCloud', 'Ping Identity'].map(
                    (provider) => (
                      <Badge
                        key={provider}
                        variant="secondary"
                        className="bg-background hover:bg-muted transition-colors"
                      >
                        {provider}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Automatic provisioning info - shown when connections exist */}
              <div className="rounded-lg border bg-muted/30 p-3 flex gap-3">
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage
                    defaultMessage="Users from allowed domains are automatically created when they sign in via SSO for the first time."
                    id="Tenant Security Settings / JIT Provisioning Hint"
                  />
                </p>
              </div>

              {connections.map((connection) => {
                const isSaml = connection.isSaml || connection.connectionType.toLowerCase() === 'saml';

                return (
                  <div
                    key={connection.id}
                    className={cn(
                      'group relative flex items-center justify-between rounded-lg border p-4 transition-all',
                      'hover:shadow-sm hover:border-primary/20',
                      connection.isActive && 'border-l-2 border-l-emerald-500'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Connection Icon */}
                      <div
                        className={cn(
                          'flex h-11 w-11 items-center justify-center rounded-lg transition-colors',
                          connection.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {isSaml ? <Building2 className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
                      </div>

                      {/* Connection Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{connection.name}</span>
                          {getStatusBadge(connection.isActive)}
                          {getConnectionTypeBadge(connection)}
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-1 cursor-default">
                                <Users className="h-3.5 w-3.5" />
                                <FormattedMessage
                                  defaultMessage="{count, plural, =0 {No logins} one {# login} other {# logins}}"
                                  id="SSO Card / Login Count"
                                  values={{ count: connection.loginCount }}
                                />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <FormattedMessage
                                defaultMessage="Total sign-ins via this connection"
                                id="SSO Card / Login Count Tooltip"
                              />
                            </TooltipContent>
                          </Tooltip>

                          {connection.lastLoginAt && (
                            <>
                              <span className="text-muted-foreground/50">•</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex items-center gap-1 cursor-default">
                                    <Activity className="h-3.5 w-3.5" />
                                    <FormattedMessage
                                      defaultMessage="Last: {date}"
                                      id="SSO Card / Last Login"
                                      values={{ date: formatDate(connection.lastLoginAt) }}
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <FormattedMessage
                                    defaultMessage="Most recent sign-in"
                                    id="SSO Card / Last Login Tooltip"
                                  />
                                </TooltipContent>
                              </Tooltip>
                            </>
                          )}

                          {connection.createdAt && (
                            <>
                              <span className="text-muted-foreground/50">•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <FormattedMessage
                                  defaultMessage="Added {date}"
                                  id="SSO Card / Created At"
                                  values={{ date: formatDate(connection.createdAt) }}
                                />
                              </span>
                            </>
                          )}
                        </div>

                        {/* Allowed Domains */}
                        {connection.allowedDomains && connection.allowedDomains.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap mt-2">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground">
                              <FormattedMessage defaultMessage="Domains:" id="SSO Card / Domains Label" />
                            </span>
                            {connection.allowedDomains.map((domain) => (
                              <Badge key={domain} variant="secondary" className="text-xs font-normal">
                                {domain}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {(!connection.allowedDomains || connection.allowedDomains.length === 0) && (
                          <div className="flex items-center gap-2 mt-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span className="text-xs text-amber-600 dark:text-amber-400">
                              <FormattedMessage
                                defaultMessage="No domains configured - SSO discovery won't work"
                                id="SSO Card / No Domains Warning"
                              />
                            </span>
                          </div>
                        )}

                        {/* Enforce SSO Toggle */}
                        {canManageSSO && connection.isActive && (
                          <div className="flex items-center gap-2 mt-2">
                            <Switch
                              checked={connection.enforceSso}
                              onCheckedChange={() => handleToggleEnforceSSO(connection)}
                              disabled={togglingEnforceSSO === connection.id}
                              aria-label={intl.formatMessage({
                                defaultMessage: 'Enforce SSO login',
                                id: 'SSO Card / Enforce SSO Toggle Label',
                              })}
                            />
                            <span className="text-xs font-medium">
                              <FormattedMessage
                                defaultMessage="Enforce SSO login"
                                id="SSO Card / Enforce SSO Label"
                              />
                            </span>
                            {connection.enforceSso && (
                              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs">
                                <ShieldAlert className="mr-1 h-3 w-3" />
                                <FormattedMessage
                                  defaultMessage="Enforced"
                                  id="SSO Card / Enforce SSO Badge"
                                />
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">
                            <FormattedMessage defaultMessage="Actions" id="SSO Card / Actions" />
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingConnection(connection);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <FormattedMessage defaultMessage="Edit connection" id="SSO Card / Edit Connection" />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTestConnection(connection)}
                          disabled={testingConnectionId === connection.id}
                        >
                          {testingConnectionId === connection.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <FlaskConical className="mr-2 h-4 w-4" />
                          )}
                          <FormattedMessage defaultMessage="Test connection" id="SSO Card / Test Connection" />
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleToggleActive(connection)}
                          disabled={toggling === connection.id}
                        >
                          {toggling === connection.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : connection.isActive ? (
                            <PowerOff className="mr-2 h-4 w-4" />
                          ) : (
                            <Power className="mr-2 h-4 w-4" />
                          )}
                          {connection.isActive ? (
                            <FormattedMessage defaultMessage="Deactivate" id="SSO Card / Deactivate" />
                          ) : (
                            <FormattedMessage defaultMessage="Activate" id="SSO Card / Activate" />
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <ConfirmDialog
                          onContinue={() => handleDelete(connection.id)}
                          variant="destructive"
                          title={
                            <FormattedMessage
                              defaultMessage="Delete SSO Connection"
                              id="SSO Card / Delete Dialog Title"
                            />
                          }
                          description={
                            <FormattedMessage
                              defaultMessage="Are you sure you want to delete this SSO connection? Users will no longer be able to sign in using this identity provider."
                              id="SSO Card / Delete Dialog Description"
                            />
                          }
                        >
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            disabled={deleting === connection.id}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            {deleting === connection.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            <FormattedMessage defaultMessage="Delete connection" id="SSO Card / Delete" />
                          </DropdownMenuItem>
                        </ConfirmDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}

              {/* Enforce SSO Info Box - shown when any connection has enforce_sso enabled */}
              {connections.some((c) => c.enforceSso) && (
                <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 p-4">
                  <div className="flex gap-3">
                    <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm space-y-2">
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        <FormattedMessage
                          defaultMessage="SSO enforcement is active"
                          id="SSO Card / Enforce Info Title"
                        />
                      </p>
                      <p className="text-amber-700 dark:text-amber-300">
                        <FormattedMessage
                          defaultMessage="Users from allowed domains must sign in via SSO to access this organization. Password login will not grant access to this tenant."
                          id="SSO Card / Enforce Info Description"
                        />
                      </p>
                      <div className="border-t border-amber-200 dark:border-amber-800 pt-2 mt-2">
                        <p className="font-medium text-amber-800 dark:text-amber-200">
                          <FormattedMessage
                            defaultMessage="Break-glass access"
                            id="SSO Card / Breakglass Title"
                          />
                        </p>
                        <p className="text-amber-700 dark:text-amber-300">
                          <FormattedMessage
                            defaultMessage="Administrators with the 'Manage SSO' permission can still access this organization via password login as a break-glass mechanism. Each bypass is recorded in the security audit log for compliance review."
                            id="SSO Card / Breakglass Description"
                          />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Another Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-lg border border-dashed p-3',
                  'text-sm text-muted-foreground transition-all',
                  'hover:border-primary/40 hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <Plus className="h-4 w-4" />
                <FormattedMessage defaultMessage="Add another connection" id="SSO Card / Add Another Button" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setEditingConnection(null);
        }}
      >
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="edit-sso-dialog-description">
          <DialogTitle className="sr-only">
            <FormattedMessage defaultMessage="Edit SSO Connection" id="SSO Card / Edit Dialog Title" />
          </DialogTitle>
          <DialogDescription id="edit-sso-dialog-description" className="sr-only">
            <FormattedMessage
              defaultMessage="View and edit SSO connection configuration"
              id="SSO Card / Edit Dialog Description"
            />
          </DialogDescription>
          {tenantId && editingConnection && (
            <EditSSOConnectionModal
              connection={editingConnection}
              closeModal={() => {
                setIsEditModalOpen(false);
                setEditingConnection(null);
              }}
              onSuccess={refetch}
              tenantId={tenantId}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="sso-connection-dialog-description">
          <DialogTitle className="sr-only">
            <FormattedMessage
              defaultMessage="Add SSO Connection"
              id="SSO Connection Card / Dialog Title"
            />
          </DialogTitle>
          <DialogDescription id="sso-connection-dialog-description" className="sr-only">
            <FormattedMessage
              defaultMessage="Configure SAML or OIDC single sign-on for your organization"
              id="SSO Connection Card / Dialog Description"
            />
          </DialogDescription>
          {tenantId && (
            <AddSSOConnectionModal
              closeModal={() => setIsModalOpen(false)}
              onSuccess={refetch}
              tenantId={tenantId}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Test Results Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              <FormattedMessage
                defaultMessage="Connection Test Results"
                id="SSO Card / Test Results Title"
              />
            </DialogTitle>
            <DialogDescription>
              {testResult && (
                <span className="flex items-center gap-2 mt-1">
                  <FormattedMessage
                    defaultMessage="{name} ({type})"
                    id="SSO Card / Test Results Subtitle"
                    values={{
                      name: testResult.connectionName,
                      type: testResult.connectionType.toUpperCase(),
                    }}
                  />
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {testResult && (
            <div className="flex-1 overflow-hidden flex flex-col gap-4 min-h-0">
              {/* Overall Status */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 shrink-0">
                <span className="text-sm font-medium">
                  <FormattedMessage defaultMessage="Overall Status" id="SSO Card / Test Overall Status" />
                </span>
                {getOverallStatusBadge(testResult.overallStatus)}
              </div>

              {/* Checks List - Scrollable */}
              <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                <div className="space-y-2">
                  {testResult.checks.map((check, index) => (
                    <div
                      key={index}
                      className={cn(
                        'p-3 rounded-lg border transition-colors',
                        check.status === 'success' && 'border-emerald-500/20 bg-emerald-500/5',
                        check.status === 'warning' && 'border-amber-500/20 bg-amber-500/5',
                        check.status === 'error' && 'border-red-500/20 bg-red-500/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">{getTestStatusIcon(check.status)}</div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm">{check.name}</span>
                          <p className="text-sm text-muted-foreground mt-0.5">{check.message}</p>
                          {check.details && (
                            <div className="mt-2 p-2 rounded bg-background/50 text-xs font-mono space-y-1 overflow-hidden">
                              {Object.entries(check.details).map(([key, value]) => (
                                <div key={key} className="flex flex-col sm:flex-row sm:gap-2">
                                  <span className="text-muted-foreground shrink-0">{key}:</span>
                                  <span className="break-all">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Footer */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 shrink-0">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-xs">
                  <FormattedMessage
                    defaultMessage="This test validates your SSO configuration. A successful test doesn't guarantee login will work - you should also test an actual SSO login."
                    id="SSO Card / Test Info"
                  />
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 shrink-0 border-t">
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              <FormattedMessage defaultMessage="Close" id="SSO Card / Test Close" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
