import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@sb/webapp-api-client/api';
import { Button } from '@sb/webapp-core/components/buttons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { Dialog, DialogContent } from '@sb/webapp-core/components/ui/dialog';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import { useOpenState } from '@sb/webapp-core/hooks';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { Shield, Link2, Plus, Trash2, CheckCircle2, XCircle, Loader2, Building2, Key } from 'lucide-react';
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <FormattedMessage 
              defaultMessage="Single Sign-On (SSO)" 
              id="Tenant Security Settings / SSO Header" 
            />
          </CardTitle>
          <CardDescription>
            <FormattedMessage
              defaultMessage="Configure SAML 2.0 or OIDC identity providers for your organization"
              id="Tenant Security Settings / SSO Description"
            />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canManageSSO ? (
            <div className="p-4 border rounded-lg bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  defaultMessage="Only organization owners and admins can configure SSO"
                  id="Tenant Security Settings / SSO Permission"
                />
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : connections.length === 0 ? (
            <>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Link2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      <FormattedMessage 
                        defaultMessage="No SSO connections configured" 
                        id="Tenant Security Settings / No SSO" 
                      />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <FormattedMessage
                        defaultMessage="Set up SAML or OIDC to enable enterprise authentication"
                        id="Tenant Security Settings / SSO Setup Hint"
                      />
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  <FormattedMessage 
                    defaultMessage="Add SSO Connection" 
                    id="Tenant Security Settings / Add SSO Button" 
                  />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">
                  <FormattedMessage 
                    defaultMessage="Supported Identity Providers:" 
                    id="Tenant Security Settings / Supported IdPs" 
                  />
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Okta</Badge>
                  <Badge variant="secondary">Azure AD</Badge>
                  <Badge variant="secondary">Google Workspace</Badge>
                  <Badge variant="secondary">OneLogin</Badge>
                  <Badge variant="secondary">Auth0</Badge>
                  <Badge variant="secondary">Custom SAML 2.0</Badge>
                  <Badge variant="secondary">Custom OIDC</Badge>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${connection.isActive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
                      {connection.isSaml ? (
                        <Building2 className={`h-5 w-5 ${connection.isActive ? 'text-green-600' : 'text-muted-foreground'}`} />
                      ) : (
                        <Key className={`h-5 w-5 ${connection.isActive ? 'text-green-600' : 'text-muted-foreground'}`} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{connection.name}</p>
                        <Badge variant={connection.isActive ? 'default' : 'secondary'} className="text-xs">
                          {connection.isActive ? (
                            <FormattedMessage defaultMessage="Active" id="SSO Card / Active Badge" />
                          ) : (
                            <FormattedMessage defaultMessage="Inactive" id="SSO Card / Inactive Badge" />
                          )}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {connection.connectionType.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {connection.loginCount > 0 ? (
                          <FormattedMessage
                            defaultMessage="{count} logins"
                            id="SSO Card / Login Count"
                            values={{ count: connection.loginCount }}
                          />
                        ) : (
                          <FormattedMessage
                            defaultMessage="No logins yet"
                            id="SSO Card / No Logins"
                          />
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(connection)}
                      disabled={toggling === connection.id}
                    >
                      {toggling === connection.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : connection.isActive ? (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          <FormattedMessage defaultMessage="Deactivate" id="SSO Card / Deactivate" />
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          <FormattedMessage defaultMessage="Activate" id="SSO Card / Activate" />
                        </>
                      )}
                    </Button>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deleting === connection.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {deleting === connection.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </ConfirmDialog>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                <FormattedMessage 
                  defaultMessage="Add another connection" 
                  id="SSO Card / Add Another Button" 
                />
              </Button>
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
    </>
  );
};
