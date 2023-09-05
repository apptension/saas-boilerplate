import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';
import { Command } from '@oclif/core';

import * as childProcess from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import { lookpath } from 'lookpath';

import { validateStageEnv } from './env';
import { color } from '@oclif/color';

const exec = promisify(childProcess.exec);

type LoadAWSCredentialsOptions = {
  envStage: string;
  validateEnvStageVariables: boolean;
};

async function loadStageEnv(
  context: Command,
  envStage: string,
  shouldValidate = true
) {
  const chamberExists = await lookpath('chamber');
  if (!chamberExists) {
    context.error(
      'chamber executable missing. Make sure it is installed in the system and re-run the command.'
    );
  }

  let chamberOutput;
  try {
    const { stdout } = await exec(`chamber export ${envStage} --format dotenv`);
    chamberOutput = stdout;
  } catch (err) {
    context.error(
      `Failed to load environmental variables from SSM Parameter Store using chamber: ${err}`
    );
  }

  const parsed = dotenv.parse(Buffer.from(chamberOutput));
  context.log(
    `Loaded ${
      Object.keys(parsed).length
    } environmental variables from SSM Parameter Store using chamber.\n`
  );
  // @ts-ignore
  dotenv.populate(process.env, parsed);

  if (shouldValidate) {
    await validateStageEnv();
  }
}

export const initAWS = async (
  context: Command,
  options: LoadAWSCredentialsOptions
) => {
  const awsVaultExists = await lookpath('aws-vault');
  if (awsVaultExists) {
    const awsVaultProfile = process.env.AWS_VAULT_PROFILE;

    const { stdout } = await exec(`aws-vault export ${awsVaultProfile}`);
    const credentials = dotenv.parse(stdout);

    // @ts-ignore
    dotenv.populate(process.env, credentials);
  }

  let awsAccountId;
  try {
    const stsClient = new STSClient();
    const { Account } = await stsClient.send(new GetCallerIdentityCommand({}));
    awsAccountId = Account;
  } catch (error) {
    context.error(
      'No valid AWS Credentials found in environment variables. We recommend installing aws-vault to securely manage AWS profiles'
    );
  }

  context.log(
    `----------
"${color.red(
      options.envStage
    )}" is set as a current environment stage. Live AWS session credentials are being used.
----------\n`
  );

  await loadStageEnv(
    context,
    options.envStage,
    options.validateEnvStageVariables
  );

  return {
    awsAccountId,
    awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION,
  };
};
