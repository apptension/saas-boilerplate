import { useQuery } from '@apollo/client/react';
import { setUserId } from '@sb/webapp-core/services/analytics';
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef } from 'react';

import { CurrentUserType } from '../../graphql';
import commonDataContext from './commonQuery.context';
import { commonQueryCurrentUserQuery } from './commonQuery.graphql';

/**
 *
 * @param children
 * @constructor
 *
 * @category Component
 */
export const CommonQuery = ({ children }: PropsWithChildren) => {
  const { loading, data, error, refetch } = useQuery(commonQueryCurrentUserQuery, { nextFetchPolicy: 'network-only' });
  const redirectAttempted = useRef(false);

  const reload = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      // Ignore AbortError - this happens when the component unmounts during refetch
      // which is expected behavior during navigation/login flows
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      throw error;
    }
  }, [refetch]);

  const value = useMemo(() => ({ data: data || null, reload }), [data, reload]);

  const userId = (data?.currentUser as CurrentUserType)?.id;

  useEffect(() => {
    userId && setUserId(userId);
  }, [userId]);

  // Handle authentication errors - if we get an error and no data, the session likely expired
  // The refreshTokenLink should have already attempted to refresh and redirected if failed
  // This is a fallback to prevent blank pages if the redirect didn't happen
  useEffect(() => {
    if (error && !data && !loading && !redirectAttempted.current) {
      const isAuthError =
        error.message?.includes('401') ||
        error.message?.includes('Unauthorized') ||
        error.graphQLErrors?.some((e) => e.extensions?.['code'] === 'UNAUTHENTICATED');

      if (isAuthError) {
        redirectAttempted.current = true;

        // Extract locale from current pathname
        const pathname = window.location.pathname;
        const localeMatch = pathname.match(/^\/([a-z]{2})\//);
        const locale = localeMatch ? localeMatch[1] : 'en';
        const loginPath = `/${locale}/auth/login`;

        // Only redirect if not already on login page
        if (!pathname.includes('/auth/login')) {
          // Clear stale auth data
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
          } catch {
            // Ignore storage errors
          }

          window.location.replace(loginPath);
        }
      }
    }
  }, [error, data, loading]);

  // Show loading state while fetching
  if (loading) {
    return null;
  }

  // If we have an error but no data, render children with null data
  // This allows the app to render (potentially showing login page or error state)
  // instead of showing a blank page forever
  if (error && !data) {
    // For non-auth errors or while redirecting, provide empty context to prevent blank page
    const emptyValue = { data: null, reload };
    return <commonDataContext.Provider value={emptyValue}>{children}</commonDataContext.Provider>;
  }

  if (!data) {
    return null;
  }

  return <commonDataContext.Provider value={value}>{children}</commonDataContext.Provider>;
};
