import { FormattedMessage, useIntl } from 'react-intl';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  LogOut,
  MapPin,
  Clock,
} from 'lucide-react';

import { Button } from '@sb/webapp-core/components/buttons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import { useToast } from '@sb/webapp-core/toast/useToast';

import { useSessions } from '../../hooks/useSessions';

interface Session {
  id: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  location: string;
  isActive: boolean;
  isCurrent: boolean;
  lastActivityAt: string;
  expiresAt: string;
  createdAt: string;
}

export function SessionsManager() {
  const intl = useIntl();
  const { toast } = useToast();

  const { sessions, loading, revokeSession, revokeAllSessions } = useSessions();

  const handleRevoke = async (sessionId: string) => {
    try {
      await revokeSession({
        variables: {
          sessionId,
          reason: 'User requested',
        },
      });
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Session revoked',
          id: 'Sessions / Revoke success',
        }),
        variant: 'success',
      });
    } catch (error) {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to revoke session',
          id: 'Sessions / Revoke failed',
        }),
        variant: 'destructive',
      });
    }
  };

  const handleRevokeAll = async () => {
    try {
      const result = await revokeAllSessions();
      const count = result.data?.revokeAllSessions?.revokedCount || 0;
      toast({
        description: intl.formatMessage(
          {
            defaultMessage: '{count} sessions revoked',
            id: 'Sessions / Revoke all success',
          },
          { count }
        ),
        variant: 'success',
      });
    } catch (error) {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to revoke sessions',
          id: 'Sessions / Revoke all failed',
        }),
        variant: 'destructive',
      });
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return intl.formatMessage({ defaultMessage: 'Just now', id: 'Time / Just now' });
    }
    if (diffMins < 60) {
      return intl.formatMessage(
        { defaultMessage: '{mins} min ago', id: 'Time / Minutes ago' },
        { mins: diffMins }
      );
    }
    if (diffHours < 24) {
      return intl.formatMessage(
        { defaultMessage: '{hours} hours ago', id: 'Time / Hours ago' },
        { hours: diffHours }
      );
    }
    return intl.formatMessage(
      { defaultMessage: '{days} days ago', id: 'Time / Days ago' },
      { days: diffDays }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const activeSessions = sessions.filter((s: Session) => s.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            <FormattedMessage defaultMessage="Active Sessions" id="Sessions / Title" />
          </h2>
          <p className="text-muted-foreground">
            <FormattedMessage
              defaultMessage="Manage your active sign-in sessions across devices"
              id="Sessions / Description"
            />
          </p>
        </div>
        {activeSessions.length > 1 && (
          <ConfirmDialog
            onContinue={handleRevokeAll}
            variant="destructive"
            title={
              <FormattedMessage
                defaultMessage="Sign out of all devices?"
                id="Sessions / Revoke all confirm title"
              />
            }
            description={
              <FormattedMessage
                defaultMessage="This will sign you out of all devices except the current one. You will need to sign in again on those devices."
                id="Sessions / Revoke all confirm description"
              />
            }
          >
            <Button variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              <FormattedMessage defaultMessage="Sign out all devices" id="Sessions / Sign out all" />
            </Button>
          </ConfirmDialog>
        )}
      </div>

      {activeSessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              <FormattedMessage defaultMessage="No active sessions" id="Sessions / No sessions title" />
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              <FormattedMessage
                defaultMessage="You don't have any active sessions. This can happen if you've signed out everywhere."
                id="Sessions / No sessions description"
              />
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {activeSessions.map((session: Session) => (
            <Card key={session.id} className={session.isCurrent ? 'border-primary' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {session.deviceName || session.browser || 'Unknown device'}
                        {session.isCurrent && (
                          <Badge variant="default" className="bg-primary">
                            <FormattedMessage defaultMessage="Current" id="Sessions / Current" />
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {session.browser} on {session.operatingSystem}
                      </CardDescription>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <ConfirmDialog
                      onContinue={() => handleRevoke(session.id)}
                      variant="destructive"
                      title={
                        <FormattedMessage
                          defaultMessage="Sign out of this device?"
                          id="Sessions / Revoke confirm title"
                        />
                      }
                      description={
                        <FormattedMessage
                          defaultMessage="This will end the session on this device. You will need to sign in again."
                          id="Sessions / Revoke confirm description"
                        />
                      }
                    >
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <FormattedMessage defaultMessage="Sign out" id="Sessions / Sign out" />
                      </Button>
                    </ConfirmDialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{session.location || session.ipAddress || 'Unknown location'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      <FormattedMessage
                        defaultMessage="Active {time}"
                        id="Sessions / Last active"
                        values={{ time: formatRelativeTime(session.lastActivityAt) }}
                      />
                    </span>
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

