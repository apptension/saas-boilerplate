import { Command } from '@oclif/core';
import { color } from '@oclif/color';

import { ENV_STAGE_LOCAL, loadDotenv } from './env';
import { loadAWSCredentials } from './aws';
import { getEnvStage } from './storage';

type InitConfigOptions = {
  requireAwsCredentials?: boolean;
};
export const initConfig = async (
  context: Command,
  { requireAwsCredentials = false }: InitConfigOptions
) => {
  await loadDotenv();
  const envStage = await getEnvStage();
  const projectName = process.env.PROJECT_NAME;

  if (!projectName) {
    context.error(
      'PROJECT_NAME environmental variable needs to be defined. You can set it in <root>/.env file or in the system'
    );
  }

  let awsAccountId: string | undefined;
  let awsRegion: string | undefined;
  if (requireAwsCredentials) {
    if (envStage === ENV_STAGE_LOCAL) {
      context.error(
        `Remote environment stage required.\nPlease call \`${color.green(
          'saas set-env [stage-name]'
        )}\` first`
      );
    }

    const awsMetadata = await loadAWSCredentials(context);

    awsAccountId = awsMetadata.awsAccountId;
    awsRegion = awsMetadata.awsRegion;

    context.log(
      `----------
"${color.red(
        envStage
      )}" is set as a current environment stage. Live AWS session credentials are being used.
----------\n`
    );
  }

  const projectEnvName = `${projectName}-${envStage}`;

  return {
    projectName,
    projectEnvName,
    envStage,
    awsRegion,
    awsAccountId,
  };
};
