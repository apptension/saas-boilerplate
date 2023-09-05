import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';
import { Command } from '@oclif/core';

import * as childProcess from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import { lookpath } from 'lookpath';

const exec = promisify(childProcess.exec);
export const loadAWSCredentials = async (context: Command) => {
  const awsVaultExists = await lookpath('aws-vault');
  if (awsVaultExists) {
    const awsVaultProfile = process.env.AWS_VAULT_PROFILE;

    const { stdout } = await exec(`aws-vault export ${awsVaultProfile}`);
    const parsedCredentials = dotenv.parse(stdout);

    // @ts-ignore
    dotenv.populate(process.env, parsedCredentials);
  }

  try {
    const stsClient = new STSClient();
    const { Account: awsAccountId } = await stsClient.send(
      new GetCallerIdentityCommand({})
    );

    return {
      awsAccountId,
      awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION,
    };
  } catch (error) {
    context.error(
      'No valid AWS Credentials found in environment variables. We recommend installing aws-vault to securely manage AWS profiles'
    );
  }
};
