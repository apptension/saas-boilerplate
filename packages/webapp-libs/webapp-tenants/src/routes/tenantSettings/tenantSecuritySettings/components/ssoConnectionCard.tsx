import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@sb/webapp-api-client/api';
import { Button } from '@sb/webapp-core/components/buttons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { Dialog, DialogContent } from '@sb/webapp-core/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@sb/webapp-core/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@sb/webapp-core/components/ui/tooltip';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import { useOpenState } from '@sb/webapp-core/hooks';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { cn } from '@sb/webapp-core/lib/utils';
import {
  Shield,
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
} from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { useCurrentTenant } from '../../../../providers';
import { AddSSOConnectionModal } from './addSSOConnectionModal';

type SSOConnection = {
  id: string;
  name: string;
  connectionType: string;
  status: string;
  isActive: boolean;
  isSaml: boolean;
  isOidc: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  loginCount: number;
  spMetadataUrl: string | null;
};

export type SSOConnectionCardProps = {
  canManageSSO: boolean;
};

export const SSOConnectionCard = ({ canManageSSO }: SSOConnectionCardProps) => {
  const { isOpen: isModalOpen, setIsOpen: setIsModalOpen } = useOpenState(false);
  const { toast } = useToast();
  const intl = useIntl();
  const { data: currentTenant } = useCurrentTenant();
  const tenantId = currentTenant?.id;

  const [connections, setConnections] = useState<SSOConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!canManageSSO || !tenantId) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get(`/api/sso/tenant/${tenantId}/connections/`);
      setConnections(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch SSO connections:', error);
    } finally {
      setLoading(false);
    }
  }, [canManageSSO, tenantId]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleDelete = async (connectionId: string) => {
    if (!tenantId) return;
    
    setDeleting(connectionId);
    try {
      await apiClient.delete(`/api/sso/tenant/${tenantId}/connections/${connectionId}`);
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
      toast({
        description: intl.formatMessage({
          defaultMessage: 'SSO connection deleted.',
          id: 'SSO Card / Delete Success',
        }),
        variant: 'success',
      });
    } catch (error) {
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
    const endpoint = connection.isActive ? 'deactivate' : 'activate';
    
    try {
      const response = await apiClient.post(`/api/sso/tenant/${tenantId}/connections/${connection.id}/${endpoint}`);
      const data = response.data;
      setConnections((prev) =>
        prev.map((c) =>
          c.id === connection.id
            ? { ...c, isActive: data.isActive, status: data.status }
            : c
        )
      );
      toast({
        description: connection.isActive
          ? intl.formatMessage({
              defaultMessage: 'SSO connection deactivated.',
              id: 'SSO Card / Deactivate Success',
            })
          : intl.formatMessage({
              defaultMessage: 'SSO connection activated.',
              id: 'SSO Card / Activate Success',
            }),
        variant: 'success',
      });
    } catch (error) {
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
                    defaultMessage="Configure SAML 2.0 or OIDC identity providers for your organization"
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
            <div className="space-y-3">
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          {tenantId && (
            <AddSSOConnectionModal
              closeModal={() => setIsModalOpen(false)}
              onSuccess={fetchConnections}
              tenantId={tenantId}
            />
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
