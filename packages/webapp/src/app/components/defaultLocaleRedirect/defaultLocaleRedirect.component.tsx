import { useAvailableLocales } from '@sb/webapp-core/hooks';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Redirects to the default locale configured in the admin panel.
 * 
 * Waits for the locales to be fetched from the API to ensure
 * we redirect to the correct default language.
 */
export const DefaultLocaleRedirect = () => {
  const { pathname, search } = useLocation();
  const { defaultLocale, isLoading } = useAvailableLocales();

  // Wait for locales to load before redirecting
  // This ensures we get the correct default from the admin panel
  if (isLoading) {
    return null; // Brief loading state
  }

  // Build the redirect path
  // If we're at "/", redirect to "/{locale}"
  // If we're at "/something", redirect to "/{locale}/something"
  const redirectPath = pathname === '/' 
    ? `/${defaultLocale}` 
    : `/${defaultLocale}${pathname}`;

  return <Navigate to={`${redirectPath}${search}`} replace />;
};

