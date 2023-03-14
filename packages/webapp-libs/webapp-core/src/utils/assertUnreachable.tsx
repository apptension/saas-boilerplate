export const assertUnreachable = (variable: never, message?: string) => {
  const defaultMessage = `Didn't expect to get here`;

  throw new Error(`${message || defaultMessage}: ${variable}`);
};
