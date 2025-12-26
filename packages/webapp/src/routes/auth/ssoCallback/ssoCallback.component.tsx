import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { RoutesConfig } from '../../../app/config/routes';

/**
 * SSO Callback Handler
 * 
 * This component handles the callback after successful SSO authentication.
 * It receives JWT tokens from the backend and stores them, then redirects
 * the user to their intended destination.
 */
export const SSOCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('access');
      const refreshToken = searchParams.get('refresh');
      const next = searchParams.get('next') || '/';

      if (!accessToken || !refreshToken) {
        setError('Missing authentication tokens. Please try again.');
        return;
      }

      try {
        // Store tokens in localStorage (same pattern as regular login)
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        // Track the SSO login event
        trackEvent('auth', 'sso-login');

        // Force a full page reload to reinitialize Apollo with new tokens
        // This is more reliable than trying to reset the store in-flight
        window.location.href = next;
      } catch (err) {
        console.error('SSO callback error:', err);
        setError('Failed to complete authentication. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-destructive/10 p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-destructive">
            <FormattedMessage defaultMessage="Authentication Failed" id="SSO / Callback / Error title" />
          </h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate(generateLocalePath(RoutesConfig.login))}
            className="mt-4 text-sm text-primary underline"
          >
            <FormattedMessage defaultMessage="Return to login" id="SSO / Callback / Return to login" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-muted-foreground">
          <FormattedMessage defaultMessage="Completing sign in..." id="SSO / Callback / Loading" />
        </p>
      </div>
    </div>
  );
};

