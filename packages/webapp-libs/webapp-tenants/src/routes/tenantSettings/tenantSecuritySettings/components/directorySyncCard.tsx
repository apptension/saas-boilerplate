import { apiClient } from '@sb/webapp-api-client/api';
import { Button } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@sb/webapp-core/components/ui/dialog';
import { Label } from '@sb/webapp-core/components/ui/label';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import { useOpenState } from '@sb/webapp-core/hooks';
import { useToast } from '@sb/webapp-core/toast/useToast';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Key,
  Loader2,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
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
      const connectionsResponse = await apiClient.get(`/api/sso/tenant/${tenantId}/connections/`);
      setConnections(Array.isArray(connectionsResponse.data) ? connectionsResponse.data : []);

      // Fetch SCIM tokens
      try {
        const tokensResponse = await apiClient.get(`/api/sso/tenant/${tenantId}/scim-tokens/`);
        setTokens(Array.isArray(tokensResponse.data) ? tokensResponse.data : []);
      } catch (e) {
        // SCIM tokens endpoint might not exist yet
        setTokens([]);
      }
    } catch (error) {
      console.error('Failed to fetch SCIM data:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId, canManageSSO]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateToken = async () => {
    if (!tokenName.trim() || !tenantId) return;

    setGenerating(true);
    try {
      const response = await apiClient.post(`/api/sso/tenant/${tenantId}/scim-tokens/`, {
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
      await apiClient.delete(`/api/sso/tenant/${tenantId}/scim-tokens/${tokenId}`);
      
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
      timeStyle: 'short',
    }).format(new Date(dateStr));
  };

  const scimEndpointUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/api/sso/scim/v2` : '/api/sso/scim/v2';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <FormattedMessage
              defaultMessage="Directory Sync (SCIM)"
              id="Tenant Security Settings / SCIM Header"
            />
            {activeTokens.length > 0 && (
              <Badge variant="default" className="ml-2">
                {activeTokens.length}{' '}
                <FormattedMessage defaultMessage="active" id="SCIM / Active badge" />
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            <FormattedMessage
              defaultMessage="Automatically provision and deprovision users from your identity provider"
              id="Tenant Security Settings / SCIM Description"
            />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canManageSSO ? (
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  defaultMessage="Only organization owners and admins can configure directory sync"
                  id="Tenant Security Settings / SCIM Permission"
                />
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !hasActiveConnection ? (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted p-2">
                  <RefreshCw className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    <FormattedMessage
                      defaultMessage="Directory sync is not available"
                      id="Tenant Security Settings / No SCIM Available"
                    />
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage
                      defaultMessage="Configure and activate an SSO connection first to enable SCIM provisioning"
                      id="Tenant Security Settings / SCIM Setup Hint"
                    />
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                <Plus className="mr-2 h-4 w-4" />
                <FormattedMessage
                  defaultMessage="Generate SCIM Token"
                  id="Tenant Security Settings / SCIM Token Button"
                />
              </Button>
            </div>
          ) : activeTokens.length === 0 ? (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    <FormattedMessage
                      defaultMessage="SSO is active - SCIM is ready to configure"
                      id="Tenant Security Settings / SCIM Ready"
                    />
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage
                      defaultMessage="Generate a SCIM token to start syncing users from your identity provider"
                      id="Tenant Security Settings / SCIM Ready Hint"
                    />
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                <FormattedMessage
                  defaultMessage="Generate SCIM Token"
                  id="Tenant Security Settings / SCIM Token Button"
                />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* SCIM Endpoint URL */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4 text-primary" />
                  <FormattedMessage defaultMessage="SCIM Endpoint URL" id="SCIM / Endpoint Label" />
                </div>
                <code className="mt-2 block rounded bg-background p-2 font-mono text-xs">
                  {scimEndpointUrl}
                </code>
              </div>

              {/* Active Token List */}
              <div className="space-y-3">
                {activeTokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Key className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{token.name}</p>
                          <Badge variant="outline" className="text-xs font-mono">
                            {token.tokenPrefix}...
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            <FormattedMessage
                              defaultMessage="Created {date}"
                              id="SCIM / Created Date"
                              values={{ date: formatDate(token.createdAt) }}
                            />
                          </span>
                          {token.lastUsedAt && (
                            <>
                              <span>•</span>
                              <span>
                                <FormattedMessage
                                  defaultMessage="Last used {date}"
                                  id="SCIM / Last Used"
                                  values={{ date: formatDate(token.lastUsedAt) }}
                                />
                              </span>
                            </>
                          )}
                          {token.requestCount > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                <FormattedMessage
                                  defaultMessage="{count} requests"
                                  id="SCIM / Request Count"
                                  values={{ count: token.requestCount }}
                                />
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
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
                          defaultMessage="This will permanently disable this token. Your identity provider will no longer be able to sync users using this token. This action cannot be undone - you'll need to generate a new token and update your IdP configuration."
                          id="SCIM / Revoke Dialog Description"
                        />
                      }
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={revokingId === token.id}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        {revokingId === token.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <FormattedMessage defaultMessage="Revoke" id="SCIM / Revoke Button" />
                          </>
                        )}
                      </Button>
                    </ConfirmDialog>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                <FormattedMessage defaultMessage="Generate another token" id="SCIM / Add Another" />
              </Button>
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
    </>
  );
};
