import { auth } from '@sb/webapp-api-client/api';
import { apolloClient } from '@sb/webapp-api-client/graphql';
import { setUserId } from '@sb/webapp-core/services/analytics';
import { useEffect, useRef } from 'react';

export const Logout = () => {
  const logoutInitiated = useRef(false);

  useEffect(() => {
    // Prevent double execution in StrictMode
    if (logoutInitiated.current) return;
    logoutInitiated.current = true;

    (async () => {
      // Clear user tracking first
      setUserId(null);

      // Stop Apollo to prevent any in-flight requests
      try {
        apolloClient.stop();
      } catch {
        // Ignore errors
      }

      // Call backend logout to clear session cookies (HTTP-only)
      try {
        await auth.logout();
      } catch {
        // Ignore logout errors - session might already be invalid
      }

      // Clear Apollo cache
      try {
        await apolloClient.clearStore();
      } catch {
        // Ignore cache clear errors
      }

      // Clear any localStorage/sessionStorage auth data
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        sessionStorage.clear();
      } catch {
        // Ignore storage errors
      }

      // Extract locale from current pathname for redirect
      const pathname = window.location.pathname;
      const localeMatch = pathname.match(/^\/([a-z]{2})\//);
      const locale = localeMatch ? localeMatch[1] : 'en';

      // Use window.location.replace for a full page reload
      // This ensures all React state is cleared and the app re-initializes fresh
      // React Router's navigate() would keep stale state in memory
      window.location.replace(`/${locale}/auth/login`);
    })();
  }, []);

  return null;
};
