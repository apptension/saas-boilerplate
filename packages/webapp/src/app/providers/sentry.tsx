import { ReactNode } from 'react';
import { init, ErrorBoundary } from '@sentry/react';
import { ENV } from '../config/env';

init({ dsn: ENV.SENTRY_DSN, environment: ENV.ENVIRONMENT_NAME });

export const SentryProvider = ({ children }: { children: ReactNode }) => ENV.SENTRY_DSN ?
  <ErrorBoundary fallback={<span>An error has occurred</span>}>{children}</ErrorBoundary> : <>{children}</>;
