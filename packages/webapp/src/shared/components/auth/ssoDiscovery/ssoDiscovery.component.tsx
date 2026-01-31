import { Button } from '@sb/webapp-core/components/ui/button';
import { ENV } from '@sb/webapp-core/config/env';
import { Building2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

export interface SSOConnection {
  id: string;
  name: string;
  type: 'saml' | 'oidc';
  tenant_id: string;
  tenant_name: string;
  login_url: string;
}

export interface SSODiscoveryResult {
  sso_available: boolean;
  require_sso: boolean;
  connections: SSOConnection[];
}

interface SSODiscoveryProps {
  email: string;
  onSSORequired?: (required: boolean) => void;
}

/**
 * SSO Discovery Component
 *
 * Automatically discovers SSO options based on the user's email domain.
 * Shows SSO login buttons when the user's organization has SSO configured.
 */
export const SSODiscovery = ({ email, onSSORequired }: SSODiscoveryProps) => {
  const [discoveryResult, setDiscoveryResult] = useState<SSODiscoveryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastCheckedEmail, setLastCheckedEmail] = useState('');

  const discoverSSO = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setDiscoveryResult(null);
      return;
    }

    // Debounce - don't check the same email twice
    if (emailToCheck === lastCheckedEmail) {
      return;
    }

    setLoading(true);
    setLastCheckedEmail(emailToCheck);

    try {
      const response = await fetch(`${ENV.BASE_API_URL}/sso/discover?email=${encodeURIComponent(emailToCheck)}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        setDiscoveryResult(null);
        return;
      }

      const result: SSODiscoveryResult = await response.json();
      setDiscoveryResult(result);

      // Notify parent if SSO is required (password login should be disabled)
      if (onSSORequired) {
        onSSORequired(result.require_sso);
      }
    } catch (error) {
      console.error('SSO discovery error:', error);
      setDiscoveryResult(null);
    } finally {
      setLoading(false);
    }
  }, [lastCheckedEmail, onSSORequired]);

  useEffect(() => {
    // Debounce the discovery by 500ms after email changes
    const timer = setTimeout(() => {
      discoverSSO(email);
    }, 500);

    return () => clearTimeout(timer);
  }, [email, discoverSSO]);

  // Check if SSO feature is enabled
  if (!ENV.ENABLE_SSO) {
    return null;
  }

  const handleSSOLogin = (connection: SSOConnection) => {
    // Get the intended destination from URL params, or default to home
    const urlParams = new URLSearchParams(window.location.search);
    const intendedDestination = urlParams.get('next') || '/';
    const next = encodeURIComponent(intendedDestination);

    // The backend returns a relative URL like /api/sso/saml/{id}/login
    // We need to prepend the API base URL when webapp and API are on different domains
    const loginUrl = connection.login_url.startsWith('http')
      ? connection.login_url
      : `${ENV.BASE_API_URL}${connection.login_url.replace(/^\/api/, '')}`;

    // Redirect to SSO login endpoint
    window.location.href = `${loginUrl}?next=${next}&login_hint=${encodeURIComponent(email)}`;
  };

  if (!discoveryResult?.sso_available) {
    return null;
  }

  return (
    <div className="space-y-3">
      {discoveryResult.connections.length === 1 ? (
        // Single SSO connection - show as primary option
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-primary">
            <Building2 className="h-4 w-4" />
            <span>
              <FormattedMessage
                defaultMessage="SSO available for {domain}"
                id="SSO / Discovery / SSO available"
                values={{ domain: email.split('@')[1] }}
              />
            </span>
          </div>
          <Button
            type="button"
            className="w-full"
            onClick={() => handleSSOLogin(discoveryResult.connections[0])}
            disabled={loading}
          >
            <FormattedMessage
              defaultMessage="Continue with {provider}"
              id="SSO / Discovery / Continue button"
              values={{ provider: discoveryResult.connections[0].name }}
            />
          </Button>
          {discoveryResult.require_sso && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              <FormattedMessage
                defaultMessage="Your organization requires SSO for sign in"
                id="SSO / Discovery / SSO required"
              />
            </p>
          )}
        </div>
      ) : (
        // Multiple SSO connections - show options
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-primary">
            <Building2 className="h-4 w-4" />
            <span>
              <FormattedMessage
                defaultMessage="Choose your organization"
                id="SSO / Discovery / Choose organization"
              />
            </span>
          </div>
          <div className="space-y-2">
            {discoveryResult.connections.map((connection) => (
              <Button
                key={connection.id}
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSSOLogin(connection)}
                disabled={loading}
              >
                <Building2 className="mr-2 h-4 w-4" />
                {connection.tenant_name} ({connection.name})
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

