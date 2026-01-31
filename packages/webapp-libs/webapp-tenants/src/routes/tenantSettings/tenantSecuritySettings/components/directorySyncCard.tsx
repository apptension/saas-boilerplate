import { apiClient, apiURL } from '@sb/webapp-api-client/api';
import { Button } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@sb/webapp-core/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@sb/webapp-core/components/ui/dropdown-menu';
import { Label } from '@sb/webapp-core/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@sb/webapp-core/components/ui/tooltip';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import { useOpenState } from '@sb/webapp-core/hooks';
import { cn } from '@sb/webapp-core/lib/utils';
import { useToast } from '@sb/webapp-core/toast/useToast';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Copy,
  Activity,
  Key,
  Link2,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  Hash,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { useCurrentTenant } from '../../../../providers';

export type DirectorySyncCardProps = {
  canManageSSO: boolean;
};

interface SSOConnection {
  id: string;
  name: string;
  connectionType: string;
  status: string;
  isActive: boolean;
}

interface SCIMToken {
  id: string;
  name: string;
  tokenPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  isActive: boolean;
  requestCount: number;
}

export const DirectorySyncCard = ({ canManageSSO }: DirectorySyncCardProps) => {
  const intl = useIntl();
  const { toast } = useToast();
  const { data: currentTenant } = useCurrentTenant();
  const tenantId = currentTenant?.id;

  const { isOpen: isModalOpen, setIsOpen: setIsModalOpen } = useOpenState(false);
  const [connections, setConnections] = useState<SSOConnection[]>([]);
  const [tokens, setTokens] = useState<SCIMToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Check if there's at least one active SSO connection
  const hasActiveConnection = connections.some((c) => c.isActive || c.status === 'active');

  // Only show active tokens in the main list
  const activeTokens = tokens.filter((t) => t.isActive);

  const fetchData = useCallback(async () => {
    if (!tenantId || !canManageSSO) {
      setLoading(false);
      return;
    }

    try {
      // Fetch SSO connections
      const connectionsResponse = await apiClient.get(apiURL(`/sso/tenant/${tenantId}/connections/`));
      setConnections(Array.isArray(connectionsResponse.data) ? connectionsResponse.data : []);

      // Fetch SCIM tokens
      try {
        const tokensResponse = await apiClient.get(apiURL(`/sso/tenant/${tenantId}/scim-tokens/`));
        setTokens(Array.isArray(tokensResponse.data) ? tokensResponse.data : []);
      } catch (e) {
        // SCIM tokens endpoint might not exist yet
        setTokens([]);
      }
    } catch (error) {
      // Silently handle errors - SCIM data may not be accessible due to permissions
      if (process.env['NODE_ENV'] === 'development') {
        console.warn('Failed to fetch SCIM data (this is expected if user lacks permissions):', error);
      }
    } finally {
      setLoading(false);
    }
  }, [tenantId, canManageSSO]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for SSO connection changes from the SSO card
  useEffect(() => {
    const handleSSOChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ tenantId: string }>;
      // Only refetch if the change was for this tenant
      if (customEvent.detail.tenantId === tenantId) {
        fetchData();
      }
    };

    window.addEventListener('sso-connections-changed', handleSSOChange);
    return () => {
      window.removeEventListener('sso-connections-changed', handleSSOChange);
    };
  }, [fetchData, tenantId]);

  const handleGenerateToken = async () => {
    if (!tokenName.trim() || !tenantId) return;

    setGenerating(true);
    try {
      const response = await apiClient.post(apiURL(`/sso/tenant/${tenantId}/scim-tokens/`), {
        name: tokenName,
      });

      setGeneratedToken(response.data.token);
      // Refetch to update the list
      await fetchData();
    } catch (error: any) {
      toast({
        description:
          error.response?.data?.error ||
          intl.formatMessage({
            defaultMessage: 'Failed to generate SCIM token.',
            id: 'SCIM Card / Generate Error',
          }),
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    if (!tenantId) return;

    setRevokingId(tokenId);
    try {
      await apiClient.delete(apiURL(`/sso/tenant/${tenantId}/scim-tokens/${tokenId}`));

      // Refetch to update the list properly
      await fetchData();

      toast({
        description: intl.formatMessage({
          defaultMessage: 'SCIM token revoked. It can no longer be used.',
          id: 'SCIM Card / Revoke Success',
        }),
        variant: 'success',
      });
    } catch (error) {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to revoke token.',
          id: 'SCIM Card / Revoke Error',
        }),
        variant: 'destructive',
      });
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopyToken = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTokenName('');
    setGeneratedToken(null);
    setCopied(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
    }).format(new Date(dateStr));
  };

  const scimEndpointUrl = apiURL('/sso/scim/v2');

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  <FormattedMessage
                    defaultMessage="Directory Sync (SCIM)"
                    id="Tenant Security Settings / SCIM Header"
                  />
                </CardTitle>
                <CardDescription className="mt-0.5">
                  <FormattedMessage
                    defaultMessage="Automatically provision and deprovision users from your identity provider"
                    id="Tenant Security Settings / SCIM Description"
                  />
                </CardDescription>
              </div>
            </div>
            {canManageSSO && hasActiveConnection && activeTokens.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                <FormattedMessage
                  defaultMessage="Add Token"
                  id="Tenant Security Settings / Add SCIM Token Button"
                />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canManageSSO ? (
            <div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/30 p-6 text-center">
              <div className="space-y-2">
                <RefreshCw className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage
                    defaultMessage="Only organization owners and admins can configure directory sync"
                    id="Tenant Security Settings / SCIM Permission"
                  />
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !hasActiveConnection ? (
            <div className="space-y-6">
              {/* Empty State - No SSO Connection */}
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                  <RefreshCw className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold mb-1">
                  <FormattedMessage
                    defaultMessage="Directory sync requires SSO"
                    id="Tenant Security Settings / No SCIM Available"
                  />
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  <FormattedMessage
                    defaultMessage="Configure and activate an SSO connection first to enable SCIM provisioning for automatic user management."
                    id="Tenant Security Settings / SCIM Setup Hint"
                  />
                </p>
                <Button variant="outline" disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    defaultMessage="Generate SCIM Token"
                    id="Tenant Security Settings / SCIM Token Button Disabled"
                  />
                </Button>
              </div>
            </div>
          ) : activeTokens.length === 0 ? (
            <div className="space-y-6">
              {/* Empty State - SSO Active, No Tokens */}
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
                  <Link2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 mb-3">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  <FormattedMessage defaultMessage="SSO Active" id="SCIM / SSO Active Badge" />
                </Badge>
                <h3 className="text-base font-semibold mb-1">
                  <FormattedMessage
                    defaultMessage="Ready to configure directory sync"
                    id="Tenant Security Settings / SCIM Ready"
                  />
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  <FormattedMessage
                    defaultMessage="Generate a SCIM token to start syncing users automatically from your identity provider."
                    id="Tenant Security Settings / SCIM Ready Hint"
                  />
                </p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    defaultMessage="Generate SCIM Token"
                    id="Tenant Security Settings / SCIM Token Button"
                  />
                </Button>
              </div>

              {/* Supported Providers */}
              <div className="rounded-lg border bg-muted/10 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  <FormattedMessage
                    defaultMessage="Compatible Identity Providers"
                    id="Tenant Security Settings / SCIM Compatible IdPs"
                  />
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Okta', 'Azure AD', 'Google Workspace', 'OneLogin', 'JumpCloud'].map((provider) => (
                    <Badge
                      key={provider}
                      variant="secondary"
                      className="bg-background hover:bg-muted transition-colors"
                    >
                      {provider}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* SCIM Endpoint URL */}
              <div className="rounded-lg border bg-muted/10 p-4">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <FormattedMessage defaultMessage="SCIM Endpoint URL" id="SCIM / Endpoint Label" />
                </div>
                <code className="block rounded bg-background p-2 font-mono text-xs text-muted-foreground">
                  {scimEndpointUrl}
                </code>
              </div>

              {/* Active Token List */}
              {activeTokens.map((token) => (
                <div
                  key={token.id}
                  className={cn(
                    'group relative flex items-center justify-between rounded-lg border p-4 transition-all',
                    'hover:shadow-sm hover:border-primary/20',
                    'border-l-2 border-l-emerald-500'
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Token Icon */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Key className="h-5 w-5" />
                    </div>

                    {/* Token Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{token.name}</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {token.tokenPrefix}...
                        </Badge>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center gap-1 cursor-default">
                              <Calendar className="h-3.5 w-3.5" />
                              <FormattedMessage
                                defaultMessage="Created {date}"
                                id="SCIM / Created Date"
                                values={{ date: formatDate(token.createdAt) }}
                              />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <FormattedMessage
                              defaultMessage="Token creation date"
                              id="SCIM / Created Tooltip"
                            />
                          </TooltipContent>
                        </Tooltip>

                        {token.lastUsedAt && (
                          <>
                            <span className="text-muted-foreground/50">•</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center gap-1 cursor-default">
                                  <Activity className="h-3.5 w-3.5" />
                                  <FormattedMessage
                                    defaultMessage="Last: {date}"
                                    id="SCIM / Last Used"
                                    values={{ date: formatDate(token.lastUsedAt) }}
                                  />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <FormattedMessage
                                  defaultMessage="Last time this token was used"
                                  id="SCIM / Last Used Tooltip"
                                />
                              </TooltipContent>
                            </Tooltip>
                          </>
                        )}

                        {token.requestCount > 0 && (
                          <>
                            <span className="text-muted-foreground/50">•</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center gap-1 cursor-default">
                                  <Hash className="h-3.5 w-3.5" />
                                  <FormattedMessage
                                    defaultMessage="{count, plural, one {# request} other {# requests}}"
                                    id="SCIM / Request Count"
                                    values={{ count: token.requestCount }}
                                  />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <FormattedMessage
                                  defaultMessage="Total API requests made with this token"
                                  id="SCIM / Request Count Tooltip"
                                />
                              </TooltipContent>
                            </Tooltip>
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
                          <FormattedMessage defaultMessage="Actions" id="SCIM Card / Actions" />
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <ConfirmDialog
                        onContinue={() => handleRevokeToken(token.id)}
                        variant="destructive"
                        title={
                          <FormattedMessage
                            defaultMessage="Revoke SCIM Token?"
                            id="SCIM / Revoke Dialog Title"
                          />
                        }
                        description={
                          <FormattedMessage
                            defaultMessage="This will permanently disable this token. Your identity provider will no longer be able to sync users using this token. This action cannot be undone."
                            id="SCIM / Revoke Dialog Description"
                          />
                        }
                      >
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          disabled={revokingId === token.id}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          {revokingId === token.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          <FormattedMessage defaultMessage="Revoke token" id="SCIM / Revoke Button" />
                        </DropdownMenuItem>
                      </ConfirmDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}

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
                <FormattedMessage defaultMessage="Generate another token" id="SCIM / Add Another" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Token Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <FormattedMessage defaultMessage="Generate SCIM Token" id="SCIM Modal / Title" />
            </DialogTitle>
          </DialogHeader>

          {!generatedToken ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="token-name">
                  <FormattedMessage defaultMessage="Token name" id="SCIM Modal / Name Label" />
                </Label>
                <Input
                  id="token-name"
                  placeholder={intl.formatMessage({
                    defaultMessage: 'e.g., Okta SCIM Integration',
                    id: 'SCIM Modal / Name Placeholder',
                  })}
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  <FormattedMessage
                    defaultMessage="Give this token a descriptive name to identify its purpose"
                    id="SCIM Modal / Name Help"
                  />
                </p>
              </div>

              {/* Warning */}
              <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-900/20">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <FormattedMessage
                    defaultMessage="The token will only be shown once. Make sure to copy it before closing this dialog."
                    id="SCIM Modal / Warning"
                  />
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={closeModal} className="flex-1">
                  <FormattedMessage defaultMessage="Cancel" id="SCIM Modal / Cancel" />
                </Button>
                <Button
                  onClick={handleGenerateToken}
                  disabled={!tokenName.trim() || generating}
                  className="flex-1"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <FormattedMessage defaultMessage="Generating..." id="SCIM Modal / Generating" />
                    </>
                  ) : (
                    <FormattedMessage defaultMessage="Generate" id="SCIM Modal / Generate" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
                <div className="mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">
                    <FormattedMessage defaultMessage="Token generated!" id="SCIM Modal / Success" />
                  </span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  <FormattedMessage
                    defaultMessage="Copy this token now. You won't be able to see it again."
                    id="SCIM Modal / Success Warning"
                  />
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  <FormattedMessage defaultMessage="Bearer Token" id="SCIM Modal / Token Label" />
                </Label>
                <div className="flex gap-2">
                  <Input value={generatedToken} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={handleCopyToken}>
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  <FormattedMessage defaultMessage="SCIM Base URL" id="SCIM Modal / URL Label" />
                </Label>
                <Input value={scimEndpointUrl} readOnly className="font-mono text-xs" />
              </div>

              <Button onClick={closeModal} className="w-full">
                <FormattedMessage defaultMessage="Done" id="SCIM Modal / Done" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
