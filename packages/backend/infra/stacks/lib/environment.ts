import { EnvironmentSettings } from '@sb/infra-core';
import {
  EnvComponentsStack,
  MainDatabase,
  MainKmsKey,
  MainRedisCluster,
} from '@sb/infra-shared';
import { Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { getBackendChamberServiceName } from './names';

type GetBackendEnvironmentOptions = {
  envSettings: EnvironmentSettings;
  allowedHosts?: string;
  csrfTrustedOrigins?: string;
};

export function getBackendEnvironment(
  scope: Construct,
  {
    envSettings,
    allowedHosts,
    csrfTrustedOrigins,
  }: GetBackendEnvironmentOptions,
) {
  return {
    PROJECT_NAME: envSettings.projectName,
    ENVIRONMENT_NAME: envSettings.envStage,
    CHAMBER_SERVICE_NAME: getBackendChamberServiceName(envSettings),
    CHAMBER_KMS_KEY_ALIAS: MainKmsKey.getKeyAlias(envSettings),
    ...(allowedHosts ? { DJANGO_ALLOWED_HOSTS: allowedHosts } : {}),
    ...(csrfTrustedOrigins ? { CSRF_TRUSTED_ORIGINS: csrfTrustedOrigins } : {}),
    OTP_AUTH_ISSUER_NAME: envSettings.domains.webApp,
    WORKERS_EVENT_BUS_NAME:
      EnvComponentsStack.getWorkersEventBusName(envSettings),
    AWS_STORAGE_BUCKET_NAME:
      EnvComponentsStack.getFileUploadsBucketName(envSettings),
    AWS_EXPORTS_STORAGE_BUCKET_NAME:
      EnvComponentsStack.getExportsBucketName(envSettings),
    AWS_S3_CUSTOM_DOMAIN: envSettings.domains.cdn,
    DB_PROXY_ENDPOINT: Fn.importValue(
      MainDatabase.getDatabaseProxyEndpointOutputExportName(envSettings),
    ),
    AWS_CLOUDFRONT_KEY_ID: Fn.importValue(
      EnvComponentsStack.getCdnSigningPublicKeyIdExportName(envSettings),
    ),
    REDIS_CONNECTION: Fn.join('', [
      'redis://',
      Fn.importValue(
        MainRedisCluster.getMainRedisClusterAddressExportName(envSettings),
      ),
      ':6379',
    ]),
    VITE_WEB_APP_URL: `https://${envSettings.domains.webApp}`,
    VITE_EMAIL_ASSETS_URL: `https://${envSettings.domains.webApp}/email-assets`,
  };
}
