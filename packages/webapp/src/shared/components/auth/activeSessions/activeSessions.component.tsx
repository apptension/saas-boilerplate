import { Button } from '@sb/webapp-core/components/buttons';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { Loader2, Monitor, Smartphone, Tablet, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface Session {
  id: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastActive: string;
  isCurrent: boolean;
}

const getDeviceIcon = (deviceType: Session['deviceType']) => {
  switch (deviceType) {
    case 'mobile':
      return <Smartphone className="h-5 w-5" />;
    case 'tablet':
      return <Tablet className="h-5 w-5" />;
    default:
      return <Monitor className="h-5 w-5" />;
  }
};

const formatLastActive = (dateStr: string, intl: ReturnType<typeof useIntl>) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return intl.formatMessage({ defaultMessage: 'Active now', id: 'Sessions / Active now' });
  } else if (diffMinutes < 60) {
    return intl.formatMessage(
      { defaultMessage: '{minutes} minutes ago', id: 'Sessions / Minutes ago' },
      { minutes: diffMinutes }
    );
  } else if (diffHours < 24) {
    return intl.formatMessage(
      { defaultMessage: '{hours} hours ago', id: 'Sessions / Hours ago' },
      { hours: diffHours }
    );
  } else {
    return intl.formatMessage(
      { defaultMessage: '{days} days ago', id: 'Sessions / Days ago' },
      { days: diffDays }
    );
  }
};

export const ActiveSessions = () => {
  const { toast } = useToast();
  const intl = useIntl();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    // TODO: Integrate with backend API to fetch actual sessions
    // For now, show current session placeholder
    setLoading(true);
    try {
      // Simulated current session - replace with actual API call
      setSessions([
        {
          id: 'current',
          deviceType: 'desktop',
          browser: 'Current Browser',
          os: navigator.platform || 'Unknown OS',
          ipAddress: '',
          lastActive: new Date().toISOString(),
          isCurrent: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      // TODO: Integrate with backend mutation to revoke specific session
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Session has been signed out.',
          id: 'Sessions / Session Revoked',
        }),
        variant: 'success',
      });
    } finally {
      setRevokingId(null);
    }
  };

  const handleSignOutAllSessions = async () => {
    setRevoking(true);
    try {
      // TODO: Integrate with backend mutation to revoke all other sessions
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      toast({
        description: intl.formatMessage({
          defaultMessage: 'All other sessions have been signed out.',
          id: 'Sessions / All Sessions Revoked',
        }),
        variant: 'success',
      });
    } finally {
      setRevoking(false);
    }
  };

  const otherSessions = sessions.filter((s) => !s.isCurrent);
  const currentSession = sessions.find((s) => s.isCurrent);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Session */}
      {currentSession && (
        <div className="flex items-center justify-between rounded-lg border bg-primary/5 p-4 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              {getDeviceIcon(currentSession.deviceType)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">
                  <FormattedMessage defaultMessage="Current Session" id="Sessions / Current Session" />
                </p>
                <Badge variant="default" className="text-xs">
                  <FormattedMessage defaultMessage="This device" id="Sessions / This Device Badge" />
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatLastActive(currentSession.lastActive, intl)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Other Sessions */}
      {otherSessions.length > 0 && (
        <>
          <div className="space-y-2">
            {otherSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-muted p-2">
                    {getDeviceIcon(session.deviceType)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {session.browser} on {session.os}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.ipAddress}
                      {session.location && ` • ${session.location}`}
                      {' • '}
                      {formatLastActive(session.lastActive, intl)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={revokingId === session.id}
                >
                  {revokingId === session.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sign out all other sessions button */}
      {otherSessions.length > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSignOutAllSessions}
            disabled={revoking}
          >
            {revoking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <XCircle className="mr-2 h-4 w-4" />
            <FormattedMessage
              defaultMessage="Sign out all other sessions"
              id="Sessions / Sign Out All Button"
            />
          </Button>
        </div>
      )}

      {/* No other sessions message */}
      {otherSessions.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-2">
          <FormattedMessage
            defaultMessage="No other active sessions. You're only signed in on this device."
            id="Sessions / No Other Sessions"
          />
        </p>
      )}
    </div>
  );
};

