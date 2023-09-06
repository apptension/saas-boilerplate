import { Command } from '@oclif/core';
import { color } from '@oclif/color';

import { ENV_STAGE_LOCAL, loadDotenv, loadVersionEnv } from './env';
import { initAWS } from './aws';
import { getEnvStage } from './storage';

type InitConfigOptions = {
  requireAws?: boolean;
  validateEnvStageVariables?: boolean;
  requireLocalEnvStage?: boolean;
};
export const initConfig = async (
  context: Command,
  {
    requireAws = false,
    validateEnvStageVariables = true,
    requireLocalEnvStage = false,
  }: InitConfigOptions
) => {
  await loadDotenv();
  const version = await loadVersionEnv();
  const envStage = await getEnvStage();
  const projectName = process.env.PROJECT_NAME;

  if (!projectName) {
    context.error(
      'PROJECT_NAME environmental variable needs to be defined. You can set it in <root>/.env file or in the system'
    );
  }

  if (requireLocalEnvStage && envStage !== ENV_STAGE_LOCAL) {
    context.error(
      `This command should only be run on a local environment stage.
Please call \`saas set-env local\` first or open a new terminal.`
    );
  }

  let awsAccountId: string | undefined;
  let awsRegion: string | undefined;
  if (requireAws) {
    if (envStage === ENV_STAGE_LOCAL) {
      context.error(
        `Remote environment stage required.\nPlease call \`${color.green(
          'saas set-env [stage-name]'
        )}\` first. Do not use \`local\` value.`
      );
    }

    const awsMetadata = await initAWS(context, {
      envStage,
      validateEnvStageVariables,
    });

    awsAccountId = awsMetadata.awsAccountId;
    awsRegion = awsMetadata.awsRegion;
  }

  const projectEnvName = `${projectName}-${envStage}`;

  return {
    projectName,
    projectEnvName,
    envStage,
    version,
    awsRegion,
    awsAccountId,
  };
};
