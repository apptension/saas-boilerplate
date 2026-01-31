import { useMutation } from '@apollo/client/react';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Switch } from '@sb/webapp-core/components/ui/switch';
import { useToast } from '@sb/webapp-core/toast';
import { Activity, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { useCurrentTenant } from '../../../../providers';
import { updateTenantActionLoggingMutation } from '../tenantActivityLogs.graphql';

export const LoggingSettingsCard = () => {
  const intl = useIntl();
  const { toast } = useToast();
  const { data: currentTenant } = useCurrentTenant();
  const { reload } = useCommonQuery();
  const [isUpdating, setIsUpdating] = useState(false);

  const [updateLogging] = useMutation(updateTenantActionLoggingMutation, {
    onCompleted: () => {
      toast({
        title: intl.formatMessage({
          defaultMessage: 'Settings updated',
          id: 'Activity Logs / Settings updated title',
        }),
        description: intl.formatMessage({
          defaultMessage: 'Action logging settings have been updated.',
          id: 'Activity Logs / Settings updated description',
        }),
      });
      reload();
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: intl.formatMessage({
          defaultMessage: 'Error',
          id: 'Activity Logs / Error title',
        }),
        description: error.message,
      });
    },
  });

  const isEnabled = currentTenant?.actionLoggingEnabled ?? false;

  const handleToggle = async () => {
    if (!currentTenant?.id) return;

    setIsUpdating(true);
    try {
      await updateLogging({
        variables: {
          tenantId: currentTenant.id,
          enabled: !isEnabled,
        },
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FormattedMessage defaultMessage="Activity Logging" id="Activity Logs / Settings Header" />
                <Badge variant={isEnabled ? 'default' : 'secondary'} className="text-xs">
                  {isEnabled ? (
                    <FormattedMessage defaultMessage="Enabled" id="Activity Logs / Enabled badge" />
                  ) : (
                    <FormattedMessage defaultMessage="Disabled" id="Activity Logs / Disabled badge" />
                  )}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-0.5">
                <FormattedMessage
                  defaultMessage="Track changes made by users and the system"
                  id="Activity Logs / Settings Description"
                />
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              <FormattedMessage defaultMessage="Enable Activity Logging" id="Activity Logs / Toggle label" />
            </p>
            <p className="text-xs text-muted-foreground">
              <FormattedMessage
                defaultMessage="When enabled, all user and system actions will be logged for audit purposes."
                id="Activity Logs / Toggle description"
              />
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Switch checked={isEnabled} onCheckedChange={handleToggle} disabled={isUpdating} />
          </div>
        </div>

        {!isEnabled && (
          <div className="mt-4 rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <FormattedMessage
                defaultMessage="Activity logging is currently disabled. Enable it to start tracking changes in your organization."
                id="Activity Logs / Disabled hint"
              />
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
