import { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription } from '@sb/webapp-core/components/ui/alert';
import { Button } from '@sb/webapp-core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Input } from '@sb/webapp-core/components/ui/input';
import { Label } from '@sb/webapp-core/components/ui/label';
import { ENV } from '@sb/webapp-core/config/env';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useSSODiscover } from '@sb/webapp-tenants/hooks';
import { ArrowLeft, Building2, Loader2 } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { RoutesConfig } from '../../../app/config/routes';
import { AuthLogo } from '../../../shared/components/auth/authLogo';
import { FloatingThemeToggle } from '../../../shared/components/auth/floatingThemeToggle';

interface SSOConnection {
  id: string;
  name: string;
  type: 'saml' | 'oidc';
  tenant_id: string;
  tenant_name: string;
  login_url: string;
}

function handleSSOLoginRedirect(connection: SSOConnection, email: string) {
  const urlParams = new URLSearchParams(window.location.search);
  const intendedDestination = urlParams.get('next') || '/';
  const next = encodeURIComponent(intendedDestination);

  const loginUrl = connection.login_url.startsWith('http')
    ? connection.login_url
    : `${ENV.BASE_API_URL}${connection.login_url.replace(/^\/api/, '')}`;

  window.location.href = `${loginUrl}?next=${next}&login_hint=${encodeURIComponent(email)}`;
}

export const SSOLogin = () => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const { discover, result, loading } = useSSODiscover();
  const redirectedRef = useRef(false);

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setEmailError(
        intl.formatMessage({
          defaultMessage: 'Please enter a valid email address',
          id: 'SSO Login / Email error',
        })
      );
      return;
    }

    setEmailError('');
    setSubmitted(true);
    redirectedRef.current = false;
    discover(trimmed);
  };

  const discoveryResult = result;
  const hasResults = submitted && !loading && discoveryResult;
  const noConnections = hasResults && !discoveryResult.sso_available;
  const connections = discoveryResult?.connections ?? [];
  const domain = email.includes('@') ? email.split('@')[1] : '';

  useEffect(() => {
    if (hasResults && connections.length === 1 && !redirectedRef.current) {
      redirectedRef.current = true;
      handleSSOLoginRedirect(connections[0] as SSOConnection, email.trim());
    }
  }, [hasResults, connections, email]);

  const showPicker = hasResults && connections.length > 1;

  return (
    <>
      <FloatingThemeToggle />
      <div className="container flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <AuthLogo />
            </div>
            <CardTitle className="text-3xl font-semibold tracking-tight">
              <FormattedMessage defaultMessage="SSO Login" id="SSO Login / heading" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Sign in with your organization's identity provider"
                id="SSO Login / description"
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sso-email">
                  <FormattedMessage defaultMessage="Work email address" id="SSO Login / Email label" />
                </Label>
                <Input
                  id="sso-email"
                  type="email"
                  autoComplete="email"
                  placeholder={intl.formatMessage({
                    defaultMessage: 'name@company.com',
                    id: 'SSO Login / Email placeholder',
                  })}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                    if (submitted) setSubmitted(false);
                  }}
                  disabled={loading}
                />
                {emailError && <p className="text-sm text-destructive">{emailError}</p>}
              </div>

              {noConnections && (
                <Alert>
                  <AlertDescription>
                    <FormattedMessage
                      defaultMessage="No SSO connections found for this email domain. Contact your administrator or use a different sign-in method."
                      id="SSO Login / No connections"
                    />
                  </AlertDescription>
                </Alert>
              )}

              {showPicker && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-primary">
                    <Building2 className="h-4 w-4" />
                    <span>
                      <FormattedMessage
                        defaultMessage="Choose your organization"
                        id="SSO Login / Choose organization"
                      />
                    </span>
                  </div>
                  <div className="space-y-2">
                    {connections.map((connection) => (
                      <Button
                        key={connection.id}
                        type="button"
                        className="w-full justify-start"
                        onClick={() => handleSSOLoginRedirect(connection as SSOConnection, email.trim())}
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        {connection.tenant_name} ({connection.name})
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {!showPicker && (
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading || (hasResults && connections.length === 1)}
                >
                  {loading || (hasResults && connections.length === 1) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <FormattedMessage defaultMessage="Redirecting..." id="SSO Login / Redirecting button" />
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-2 h-4 w-4" />
                      <FormattedMessage defaultMessage="Continue with SSO" id="SSO Login / Submit button" />
                    </>
                  )}
                </Button>
              )}
            </form>

            <div className="text-center">
              <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground" asChild>
                <Link to={generateLocalePath(RoutesConfig.login)}>
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  <FormattedMessage defaultMessage="Back to login" id="SSO Login / Back to login" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
