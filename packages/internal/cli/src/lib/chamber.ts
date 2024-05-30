import * as childProcess from 'child_process';
import { promisify } from 'util';
import { lookpath } from 'lookpath';
import { Command, Errors } from '@oclif/core';
import * as dotenv from 'dotenv';

const { CLIError } = Errors;

const exec = promisify(childProcess.exec);

export const isChamberInstalled = async () => {
  return await lookpath('chamber');
};

export const assertChamberInstalled = async () => {
  const isInstalled = await isChamberInstalled();
  if (!isInstalled) {
    throw new CLIError(`chamber executable not found. Make sure it is installed in the system and re-run the
    command. Go to https://github.com/segmentio/chamber and learn how to install and configure it.`);
  }
};

type LoadChamberEnvOptions = {
  serviceName: string;
};
export async function loadChamberEnv(
  context: Command,
  { serviceName }: LoadChamberEnvOptions,
) {
  await assertChamberInstalled();

  let chamberOutput;
  try {
    const { stdout } = await exec(
      `chamber export ${serviceName} --format dotenv`,
    );
    chamberOutput = stdout;
  } catch (err) {
    context.error(
      `Failed to load environmental variables from SSM Parameter Store using chamber: ${err}`,
    );
  }

  const parsed = dotenv.parse(Buffer.from(chamberOutput));
  context.log(
    `Loaded environmental variables from SSM Parameter Store using chamber:
  service (prefix): ${serviceName}
  count: ${Object.keys(parsed).length}\n`,
  );

  // @ts-ignore
  dotenv.populate(process.env, parsed, { override: true });
}
