export const getEnvNumber = (key: keyof NodeJS.ProcessEnv) => {
  const value = process.env[key];
  if (value === undefined) return;
  const number = Number(value);
  if (isNaN(number)) return;
  return number;
};
