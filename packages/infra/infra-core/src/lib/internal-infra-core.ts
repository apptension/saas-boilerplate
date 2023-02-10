import { EnvironmentSettings } from './env-config';

export const getGlobalStackName = (
  baseName: string,
  envSettings: EnvironmentSettings
) => `${envSettings.projectName}-${baseName}`;

export const getEnvStackName = (
  baseName: string,
  envSettings: EnvironmentSettings
) => `${envSettings.projectEnvName}-${baseName}`;
