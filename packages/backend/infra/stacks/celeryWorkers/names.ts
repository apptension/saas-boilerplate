import { EnvironmentSettings } from '@sb/infra-core';

export function getCeleryWorkersServiceName(envSettings: EnvironmentSettings) {
  return `${envSettings.projectEnvName}-celery-workers`;
}

export function getCeleryBeatServiceName(envSettings: EnvironmentSettings) {
  return `${envSettings.projectEnvName}-celery-beat`;
}

export function getFlowerServiceName(envSettings: EnvironmentSettings) {
  return `${envSettings.projectEnvName}-flower`;
}

export function getCeleryWorkersFamily(envSettings: EnvironmentSettings) {
  return `${envSettings.projectEnvName}-celery-workers`;
}
