import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';
import { Command } from '@oclif/core';

import * as childProcess from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import { lookpath } from 'lookpath';

import { validateStageEnv } from './env';
import { color } from '@oclif/color';
import { isAwsVaultInstalled } from '../lib/awsVault';
import {
  assertChamberInstalled,
  isChamberInstalled,
  loadChamberEnv,
} from '../lib/chamber';

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
  await assertChamberInstalled();
  await loadChamberEnv(context, { serviceName: envStage });

  if (shouldValidate) {
    const validationResult = await validateStageEnv();
    Object.assign(process.env, validationResult);
  }
}

export const initAWS = async (
  context: Command,
  options: LoadAWSCredentialsOptions
) => {
  if (await isAwsVaultInstalled()) {
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
