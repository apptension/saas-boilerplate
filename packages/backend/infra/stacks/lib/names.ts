import { EnvironmentSettings } from '@sb/infra-core';

export function getBackendChamberServiceName(envSettings: EnvironmentSettings) {
  return `env-${envSettings.projectEnvName}-backend`;
}

export function getMcpServerChamberServiceName(envSettings: EnvironmentSettings) {
  return `env-${envSettings.projectEnvName}-mcp-server`;
}
