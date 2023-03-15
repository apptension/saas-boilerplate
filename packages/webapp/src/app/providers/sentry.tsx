import { ENV } from '@sb/webapp-core/config/env';
import { ErrorBoundary, init } from '@sentry/react';
import { ReactNode } from 'react';

init({ dsn: ENV.SENTRY_DSN, environment: ENV.ENVIRONMENT_NAME });

export const SentryProvider = ({ children }: { children: ReactNode }) =>
  ENV.SENTRY_DSN ? (
    <ErrorBoundary fallback={<span>An error has occurred</span>}>{children}</ErrorBoundary>
  ) : (
    <>{children}</>
  );
