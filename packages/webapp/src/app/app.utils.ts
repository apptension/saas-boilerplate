import { env } from './utils/env';

export const getRequiredEnvValue = (key: string) => {
  const envValue = env[key];

  if (!envValue) {
    throw new Error(`Env variable ${key} not set`);
  }

  return envValue;
};
