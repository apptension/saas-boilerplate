import { Command } from '@oclif/core';
import { color } from '@oclif/color';

import * as childProcess from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';

import { ENV_STAGE_LOCAL, loadDotenv, loadVersionEnv } from './env';
import { initAWS } from './aws';
import { loadEnvStage } from './storage';

const exec = promisify(childProcess.exec);

type InitConfigOptions = {
  requireAws?: boolean | 'allow-local';
  validateEnvStageVariables?: boolean;
  requireLocalEnvStage?: boolean;
};

const getRootPath = async () => {
  const { stdout } = await exec('pnpm root -w');
  return resolve(stdout, '..');
};

export const initConfig = async (
  context: Command,
  {
    requireAws = false,
    validateEnvStageVariables = true,
    requireLocalEnvStage = false,
  }: InitConfigOptions
) => {
  const rootPath = await getRootPath();
  await loadDotenv({ rootPath });
  const version = await loadVersionEnv();
  const envStage = await loadEnvStage();
  const projectName = process.env.PROJECT_NAME;

  if (!projectName) {
    context.error(
      'PROJECT_NAME environmental variable needs to be defined. You can set it in <root>/.env file or in the system'
    );
  }

  if (requireLocalEnvStage && envStage !== ENV_STAGE_LOCAL) {
    context.error(
      `This command should only be run on a local environment stage.
Please call \`saas aws set-env local\` first or open a new terminal.`
    );
  }

  let awsAccountId: string | undefined;
  let awsRegion: string | undefined;
  if (requireAws) {
    if (envStage === ENV_STAGE_LOCAL && requireAws !== 'allow-local') {
      context.error(
        `Remote environment stage required.\nPlease call \`${color.green(
          'saas aws set-env [stage-name]'
        )}\` first. Do not use \`local\` value.`
      );
    }

    if (envStage !== ENV_STAGE_LOCAL) {
      const awsMetadata = await initAWS(context, {
        envStage,
        validateEnvStageVariables,
      });

      awsAccountId = awsMetadata.awsAccountId;
      awsRegion = awsMetadata.awsRegion;
    }
  }

  const projectEnvName = `${projectName}-${envStage}`;

  return {
    rootPath,
    projectName,
    projectEnvName,
    envStage,
    version,
    awsRegion,
    awsAccountId,
  };
};
