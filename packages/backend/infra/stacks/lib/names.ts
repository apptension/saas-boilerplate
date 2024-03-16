import { EnvironmentSettings } from '@sb/infra-core';

export function getBackendChamberServiceName(envSettings: EnvironmentSettings) {
  return `env-${envSettings.projectEnvName}-backend`;
}
