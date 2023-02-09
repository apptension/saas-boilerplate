export const getRequiredEnvValue = (key: string) => {
  const envValue = import.meta.env[key];
  if (!envValue) {
    throw new Error(`Env variable ${key} not set`);
  }
  return envValue;
};
