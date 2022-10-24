import * as Sentry from '@sentry/react';

/**
 * Generic function for error reporting.
 */
export const reportError = (error: any): void => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(error); //eslint-disable-line
  }
  if (!error?.response) {
    Sentry.captureException(error);
  }
};
