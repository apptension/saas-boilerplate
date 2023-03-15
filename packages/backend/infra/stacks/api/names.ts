import { EnvironmentSettings } from '@sb/infra-core';

export function getApiServiceName(envSettings: EnvironmentSettings) {
  return `${envSettings.projectEnvName}-api`;
}
