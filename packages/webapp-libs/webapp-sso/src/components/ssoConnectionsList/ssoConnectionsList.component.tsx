import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Pencil, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
} from 'lucide-react';

import { Button } from '@sb/webapp-core/components/buttons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@sb/webapp-core/components/ui/dropdown-menu';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';

import { useSSOConnections } from '../../hooks/useSSOConnections';
import { RoutesConfig } from '../../config/routes';

interface SSOConnection {
  id: string;
  name: string;
  connectionType: string;
  status: string;
  allowedDomains: string[];
  jitProvisioningEnabled: boolean;
  samlEntityId?: string;
  samlSsoUrl?: string;
  oidcIssuer?: string;
  oidcClientId?: string;
  lastLoginAt?: string;
  loginCount: number;
  createdAt: string;
  spMetadataUrl?: string;
}

export function SSOConnectionsList() {
  const intl = useIntl();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: currentTenant } = useCurrentTenant();
  const generateTenantPath = useGenerateTenantPath();

  const tenantId = currentTenant?.id || '';
  const {
    connections,
    loading,
    activateConnection,
    deactivateConnection,
    deleteConnection,
  } = useSSOConnections(tenantId);

  const handleActivate = async (connectionId: string) => {
    try {
      await activateConnection({
        variables: {
          input: { id: connectionId },
        },
      });
      toast({
        description: intl.formatMessage({
          defaultMessage: 'SSO connection activated',
          id: 'SSO / Connection activated',
        }),
        variant: 'success',
      });
    } catch (error) {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to activate connection',
          id: 'SSO / Connection activation failed',
        }),
        variant: 'destructive',
      });
    }
  };

  const handleDeactivate = async (connectionId: string) => {
    try {
      await deactivateConnection({
        variables: { id: connectionId },
      });
      toast({
        description: intl.formatMessage({
          defaultMessage: 'SSO connection deactivated',
          id: 'SSO / Connection deactivated',
        }),
        variant: 'success',
      });
    } catch (error) {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to deactivate connection',
          id: 'SSO / Connection deactivation failed',
        }),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (connectionId: string) => {
    try {
      await deleteConnection({
        variables: {
          input: { id: connectionId },
        },
      });
      toast({
        description: intl.formatMessage({
          defaultMessage: 'SSO connection deleted',
          id: 'SSO / Connection deleted',
        }),
        variant: 'success',
      });
    } catch (error) {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to delete connection',
          id: 'SSO / Connection deletion failed',
        }),
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-emerald-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            <FormattedMessage defaultMessage="Active" id="SSO / Status active" />
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="secondary">
            <FormattedMessage defaultMessage="Draft" id="SSO / Status draft" />
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline">
            <XCircle className="mr-1 h-3 w-3" />
            <FormattedMessage defaultMessage="Inactive" id="SSO / Status inactive" />
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <FormattedMessage defaultMessage="Error" id="SSO / Status error" />
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConnectionTypeBadge = (type: string) => {
    if (type === 'saml') {
      return <Badge variant="outline">SAML 2.0</Badge>;
    }
    return <Badge variant="outline">OpenID Connect</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            <FormattedMessage defaultMessage="SSO Connections" id="SSO / Connections title" />
          </h2>
          <p className="text-muted-foreground">
            <FormattedMessage
              defaultMessage="Configure single sign-on with your identity provider"
              id="SSO / Connections description"
            />
          </p>
        </div>
        <Button onClick={() => navigate(generateTenantPath(RoutesConfig.ssoConnectionNew))}>
          <Plus className="mr-2 h-4 w-4" />
          <FormattedMessage defaultMessage="Add Connection" id="SSO / Add connection" />
        </Button>
      </div>

      {connections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              <FormattedMessage defaultMessage="No SSO connections" id="SSO / No connections title" />
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              <FormattedMessage
                defaultMessage="Set up enterprise single sign-on to allow your team members to log in with their corporate credentials."
                id="SSO / No connections description"
              />
            </p>
            <Button onClick={() => navigate(generateTenantPath(RoutesConfig.ssoConnectionNew))}>
              <Plus className="mr-2 h-4 w-4" />
              <FormattedMessage defaultMessage="Configure SSO" id="SSO / Configure SSO" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {connections.map((connection: SSOConnection) => (
            <Card key={connection.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{connection.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {getConnectionTypeBadge(connection.connectionType)}
                        {getStatusBadge(connection.status)}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(
                            generateTenantPath(
                              RoutesConfig.ssoConnectionEdit.replace(':connectionId', connection.id)
                            )
                          )
                        }
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        <FormattedMessage defaultMessage="Edit" id="SSO / Edit" />
                      </DropdownMenuItem>
                      {connection.spMetadataUrl && (
                        <DropdownMenuItem
                          onClick={() => window.open(connection.spMetadataUrl, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          <FormattedMessage defaultMessage="View SP Metadata" id="SSO / View metadata" />
                        </DropdownMenuItem>
                      )}
                      {connection.status !== 'active' ? (
                        <DropdownMenuItem onClick={() => handleActivate(connection.id)}>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          <FormattedMessage defaultMessage="Activate" id="SSO / Activate" />
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleDeactivate(connection.id)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          <FormattedMessage defaultMessage="Deactivate" id="SSO / Deactivate" />
                        </DropdownMenuItem>
                      )}
                      <ConfirmDialog
                        onContinue={() => handleDelete(connection.id)}
                        variant="destructive"
                        title={
                          <FormattedMessage
                            defaultMessage="Delete SSO Connection?"
                            id="SSO / Delete confirm title"
                          />
                        }
                        description={
                          <FormattedMessage
                            defaultMessage="This will permanently delete this SSO connection. Users will no longer be able to sign in using this identity provider."
                            id="SSO / Delete confirm description"
                          />
                        }
                      >
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <FormattedMessage defaultMessage="Delete" id="SSO / Delete" />
                        </DropdownMenuItem>
                      </ConfirmDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">
                      <FormattedMessage defaultMessage="Identity Provider" id="SSO / IdP label" />
                    </p>
                    <p className="font-medium truncate">
                      {connection.connectionType === 'saml'
                        ? connection.samlEntityId || '-'
                        : connection.oidcIssuer || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      <FormattedMessage defaultMessage="Allowed Domains" id="SSO / Domains label" />
                    </p>
                    <p className="font-medium">
                      {connection.allowedDomains?.length > 0
                        ? connection.allowedDomains.join(', ')
                        : intl.formatMessage({ defaultMessage: 'All domains', id: 'SSO / All domains' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      <FormattedMessage defaultMessage="Total Logins" id="SSO / Logins label" />
                    </p>
                    <p className="font-medium">{connection.loginCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      <FormattedMessage defaultMessage="Last Login" id="SSO / Last login label" />
                    </p>
                    <p className="font-medium">
                      {connection.lastLoginAt
                        ? new Date(connection.lastLoginAt).toLocaleDateString()
                        : intl.formatMessage({ defaultMessage: 'Never', id: 'SSO / Never' })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

