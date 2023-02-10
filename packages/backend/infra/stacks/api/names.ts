import { EnvironmentSettings } from '@saas-boilerplate-app/infra-core';

export function getApiServiceName(envSettings: EnvironmentSettings) {
  return `${envSettings.projectEnvName}-api`;
}
