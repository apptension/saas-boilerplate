import { EnvironmentSettings } from '@sb/infra-core';

export function getMcpServerServiceName(envSettings: EnvironmentSettings) {
  return `${envSettings.projectEnvName}-mcp-server`;
}
