import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import { EnvComponentsStack, MainDatabase } from '@sb/infra-shared';
import { Fn } from 'aws-cdk-lib';
import { EnvironmentSettings } from '@sb/infra-core';

/**
 * Get the name for the AI secrets stored in AWS Secrets Manager.
 * Follows the project naming convention: env-{projectName}-{envStage}-ai-secrets
 *
 * To enable AI Assistant, create a secret in AWS Secrets Manager with this name
 * containing a JSON object with the following structure:
 * {
 *   "OPENAI_API_KEY": "sk-..."
 * }
 */
export function getAiSecretsName(envSettings: EnvironmentSettings): string {
  return `env-${envSettings.projectName}-${envSettings.envStage}-ai-secrets`;
}

interface GetBackendSecretsOptions {
  envSettings: EnvironmentSettings;
  includeAiSecrets?: boolean;
}

export function getBackendSecrets(
  scope: Construct,
  { envSettings, includeAiSecrets = false }: GetBackendSecretsOptions,
) {
  const dbSecretArn = Fn.importValue(
    MainDatabase.getDatabaseSecretArnOutputExportName(envSettings),
  );

  const baseSecrets = {
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

  // AI secrets are opt-in to avoid deployment failures when not configured
  if (includeAiSecrets) {
    const aiSecretsManager = sm.Secret.fromSecretNameV2(
      scope,
      'AiSecrets',
      getAiSecretsName(envSettings),
    );
    return {
      ...baseSecrets,
      OPENAI_API_KEY: ecs.Secret.fromSecretsManager(
        aiSecretsManager,
        'OPENAI_API_KEY',
      ),
    };
  }

  return baseSecrets;
}
