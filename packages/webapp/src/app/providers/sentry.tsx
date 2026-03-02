import { ENV } from '@sb/webapp-core/config/env';
import { ErrorBoundary, init } from '@sentry/react';
import { ReactNode } from 'react';

init({ dsn: ENV.SENTRY_DSN, environment: ENV.ENVIRONMENT_NAME });

/**
 * Error fallback component that provides recovery options.
 * Shows when React encounters an unhandled error.
 */
const ErrorFallback = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleClearCacheAndRefresh = () => {
    // Clear authentication data
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      sessionStorage.clear();
    } catch {
      // Ignore storage errors
    }

    // Reload the page
    window.location.reload();
  };

  const handleGoToLogin = () => {
    // Extract locale from current pathname
    const pathname = window.location.pathname;
    const localeMatch = pathname.match(/^\/([a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : 'en';

    // Clear auth data before redirect
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      sessionStorage.clear();
    } catch {
      // Ignore storage errors
    }

    window.location.replace(`/${locale}/auth/login`);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f9fafb',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#1f2937' }}>
          Something went wrong
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          An unexpected error occurred. Please try one of the options below.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={handleRefresh}
            style={{
              padding: '0.625rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Refresh Page
          </button>
          <button
            onClick={handleClearCacheAndRefresh}
            style={{
              padding: '0.625rem 1rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Clear Cache & Refresh
          </button>
          <button
            onClick={handleGoToLogin}
            style={{
              padding: '0.625rem 1rem',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textDecoration: 'underline',
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export const SentryProvider = ({ children }: { children: ReactNode }) =>
  ENV.SENTRY_DSN ? (
    <ErrorBoundary fallback={<ErrorFallback />}>{children}</ErrorBoundary>
  ) : (
    <>{children}</>
  );
