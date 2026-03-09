import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import { EnvComponentsStack, MainDatabase } from '@sb/infra-shared';
import { Fn } from 'aws-cdk-lib';
import type { EnvironmentSettings } from '@sb/infra-core';

interface GetBackendSecretsOptions {
  envSettings: EnvironmentSettings;
}

export function getBackendSecrets(
  scope: Construct,
  { envSettings }: GetBackendSecretsOptions,
) {
  const dbSecretArn = Fn.importValue(
    MainDatabase.getDatabaseSecretArnOutputExportName(envSettings),
  );

  return {
    DB_CONNECTION: ecs.Secret.fromSecretsManager(
      sm.Secret.fromSecretCompleteArn(scope, 'DbSecret', dbSecretArn),
    ),
    AWS_CLOUDFRONT_KEY: ecs.Secret.fromSecretsManager(
      sm.Secret.fromSecretNameV2(
        scope,
        'CloudfrontPrivateKey',
        `${EnvComponentsStack.getCDNSigningKeyName(envSettings)}/private`,
      ),
    ),
  };
}
