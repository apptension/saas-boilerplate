import { Button } from '@sb/webapp-core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { AlertTriangle } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useSearchParams } from 'react-router-dom';

import { RoutesConfig } from '../../../app/config/routes';
import { AuthLogo } from '../../../shared/components/auth/authLogo';
import { FloatingThemeToggle } from '../../../shared/components/auth/floatingThemeToggle';

/**
 * Error code to message mapping for SSO errors.
 * These codes are returned by the backend to prevent information disclosure.
 */
const ERROR_MESSAGES: Record<string, { id: string; defaultMessage: string }> = {
  auth_failed: {
    id: 'SSO / Error / auth_failed',
    defaultMessage: 'Authentication failed. Please try again.',
  },
  invalid_response: {
    id: 'SSO / Error / invalid_response',
    defaultMessage: 'Invalid response from identity provider.',
  },
  missing_email: {
    id: 'SSO / Error / missing_email',
    defaultMessage: 'Email address not provided by identity provider.',
  },
  domain_not_allowed: {
    id: 'SSO / Error / domain_not_allowed',
    defaultMessage: 'Your email domain is not authorized for this organization.',
  },
  provisioning_disabled: {
    id: 'SSO / Error / provisioning_disabled',
    defaultMessage: 'Automatic account creation is disabled. Contact your administrator.',
  },
  session_expired: {
    id: 'SSO / Error / session_expired',
    defaultMessage: 'Your session has expired. Please sign in again.',
  },
  config_error: {
    id: 'SSO / Error / config_error',
    defaultMessage: 'SSO is not properly configured. Contact your administrator.',
  },
  signature_invalid: {
    id: 'SSO / Error / signature_invalid',
    defaultMessage: 'Security validation failed. Please try again.',
  },
  state_mismatch: {
    id: 'SSO / Error / state_mismatch',
    defaultMessage: 'Security check failed. Please start the sign-in process again.',
  },
  rate_limited: {
    id: 'SSO / Error / rate_limited',
    defaultMessage: 'Too many attempts. Please wait before trying again.',
  },
  generic: {
    id: 'SSO / Error / generic',
    defaultMessage: 'An error occurred during sign-in. Please try again or contact support.',
  },
};

/**
 * SSO Error Page
 *
 * Displayed when SSO authentication fails. Shows user-friendly error messages
 * based on error codes, and provides options to retry or use alternative login methods.
 */
export const SSOError = () => {
  const [searchParams] = useSearchParams();
  const generateLocalePath = useGenerateLocalePath();
  const intl = useIntl();

  // Support both ?code= (new) and ?message= (legacy) parameters
  const errorCode = searchParams.get('code') || 'generic';
  const legacyMessage = searchParams.get('message');

  // Get user-friendly error message from code
  const errorConfig = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.generic;
  const errorMessage = legacyMessage || intl.formatMessage(errorConfig);

  return (
    <>
      <FloatingThemeToggle />
      <div className="container flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <AuthLogo />
            </div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-destructive">
              <FormattedMessage defaultMessage="Sign in failed" id="SSO / Error / heading" />
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <FormattedMessage
                defaultMessage="If this problem persists, please contact your IT administrator or try an alternative sign in method."
                id="SSO / Error / description"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="default" asChild className="w-full">
                <Link to={generateLocalePath(RoutesConfig.login)}>
                  <FormattedMessage defaultMessage="Try again" id="SSO / Error / try again button" />
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link to={generateLocalePath(RoutesConfig.login)}>
                  <FormattedMessage defaultMessage="Use another sign in method" id="SSO / Error / alternative login" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

