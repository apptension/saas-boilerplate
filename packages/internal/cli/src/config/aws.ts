import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';
import { ECRClient, GetAuthorizationTokenCommand } from '@aws-sdk/client-ecr';
import { Command } from '@oclif/core';
import { color } from '@oclif/color';
import { trace } from '@opentelemetry/api';

import * as childProcess from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';

import { validateStageEnv } from './env';
import { isAwsVaultInstalled } from '../lib/awsVault';
import { assertChamberInstalled, loadChamberEnv } from '../lib/chamber';
import { runCommand } from '../lib/runCommand';

const exec = promisify(childProcess.exec);

const tracer = trace.getTracer('config:aws');

type LoadAWSCredentialsOptions = {
  envStage: string;
  validateEnvStageVariables: boolean;
  skipERCLogin?: boolean;
};

async function loadStageEnv(
  context: Command,
  envStage: string,
  shouldValidate = true,
) {
  await assertChamberInstalled();
  await loadChamberEnv(context, { serviceName: envStage });

  if (shouldValidate) {
    const validationResult = await validateStageEnv();
    Object.assign(process.env, validationResult);
  }
}

const initAWSVault = async () => {
  return tracer.startActiveSpan('initAwsVault', async (span) => {
    const awsVaultProfile = process.env.AWS_VAULT_PROFILE;

    const { stdout } = await exec(`aws-vault export ${awsVaultProfile}`);
    const credentials = dotenv.parse(stdout);

    // @ts-ignore
    dotenv.populate(process.env, credentials);

    span.end();
  });
};

type LoginToECROptions = {
  awsAccountId: string;
  awsRegion: string;
};

export const loginToECR = async (
  context: Command,
  { awsRegion, awsAccountId }: LoginToECROptions,
) => {
  const ecrClient = new ECRClient();
  const getAuthorizationTokenCommand = new GetAuthorizationTokenCommand({});
  const { authorizationData } = await ecrClient.send(
    getAuthorizationTokenCommand,
  );
  if (!authorizationData?.[0]?.authorizationToken) {
    return null;
  }

  const decodedAuthToken = Buffer.from(
    authorizationData[0].authorizationToken,
    'base64',
  ).toString('utf8');
  const password = decodedAuthToken.split(':')[1];

  try {
    const mirrorRepoUrl = `${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com`;
    await runCommand(
      'docker',
      ['login', '--username', 'AWS', '-p', password, mirrorRepoUrl],
      { silent: true },
    );

    process.env.SB_MIRROR_REPOSITORY = `${mirrorRepoUrl}/dockerhub-mirror/`;
    process.env.SB_PULL_THROUGH_CACHE_REPOSITORY = `${mirrorRepoUrl}/ecr-public/docker/library/`;

    context.log(
      `Successfully logged into ECR repository.
  SB_MIRROR_REPOSITORY=${process.env.SB_MIRROR_REPOSITORY}
  SB_PULL_THROUGH_CACHE_REPOSITORY=${process.env.SB_PULL_THROUGH_CACHE_REPOSITORY}`,
    );
  } catch (error) {
    context.warn('Login to ECR registry failed.');
    context.warn(error as Error);
  }
};

export const initAWS = async (
  context: Command,
  options: LoadAWSCredentialsOptions,
) => {
  return tracer.startActiveSpan('initAWS', async (span) => {
    if (await isAwsVaultInstalled()) {
      await initAWSVault();
    }

    let awsAccountId;
    try {
      const stsClient = new STSClient();
      const { Account } = await stsClient.send(
        new GetCallerIdentityCommand({}),
      );
      awsAccountId = Account;
    } catch (error) {
      context.error(
        'No valid AWS Credentials found in environment variables. We recommend installing aws-vault to securely manage AWS profiles',
      );
    }

    context.log(
      `----------
"${color.red(
        options.envStage,
      )}" is set as a current environment stage. Live AWS session credentials are being used.
----------\n`,
    );

    await loadStageEnv(
      context,
      options.envStage,
      options.validateEnvStageVariables,
    );

    const { skipERCLogin = false } = options;

    const awsRegion = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
    if (awsAccountId && awsRegion && !skipERCLogin) {
      await loginToECR(context, {
        awsAccountId,
        awsRegion,
      });
    }

    span.end();
    return {
      awsAccountId,
      awsRegion,
    };
  });
};
