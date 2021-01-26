/**
 * Generic function for error reporting.
 * Use it in all sagas, so you can later send errors to Sentry.
 * @param error
 * @returns void
 */
export const reportError = (error: any): void => {
  console.error(error); //eslint-disable-line
};
