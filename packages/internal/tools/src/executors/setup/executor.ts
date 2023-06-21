import * as path from 'path';
import * as fs from 'fs/promises';
import type { ExecutorContext } from '@nx/devkit';
import * as R from 'ramda';

import type { SetupExecutorSchema } from './schema';

const readEnvFile = async (envFilePath: string, required = false) => {
  try {
    await fs.lstat(envFilePath);
  } catch (e) {
    if (required) {
      console.error(
        `${envFilePath} file does not exists. Searched path: ${envFilePath}`
      );
      console.error(
        "This error is most likely a user's misconfiguration (someone deleted or renamed the file)"
      );
    }
    return null;
  }
  return await fs.readFile(envFilePath);
};

const parseEnvFile = (contents: Buffer | null) => {
  if (!contents) {
    return {};
  }

  const lines = contents.toString().split('\n');
  return lines.reduce((result, line) => {
    const pattern = new RegExp(/(.+)=(.+)/);
    const groups = line.match(pattern);
    if (!groups) {
      return result;
    }
    return {
      ...result,
      [groups[1]]: groups[2],
    };
  }, {});
};

export default async function runExecutor(
  options: SetupExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  if (process.env.ENV_STAGE && process.env.ENV_STAGE !== 'local') {
    console.log('Skipping setup for non-local env');
    return { success: true };
  }
  const cwd = path.join(context.root, options.cwd);

  const envSharedFile = options.envSharedFile ?? '.env.shared';
  const envFileOutput = options.envFileOutput ?? '.env';

  const envSharedFilePath = path.join(cwd, envSharedFile);
  const envSharedFileContents = await readEnvFile(envSharedFilePath, true);
  const envFileOutputPath = path.join(cwd, envFileOutput);
  const envFileContents = await readEnvFile(envFileOutputPath);

  if (!envSharedFileContents) {
    return { success: false };
  }

  const sharedEnvs = parseEnvFile(envSharedFileContents);
  const existingEnvs = parseEnvFile(envFileContents);

  const envs = R.mergeRight(sharedEnvs, existingEnvs);

  const additionalEnvKeys = R.difference(
    Object.keys(existingEnvs),
    Object.keys(sharedEnvs)
  );

  const modifiedSharedFile = Object.keys(envs).reduce((result, envKey) => {
    const pattern = new RegExp(`${envKey}=.+`);
    return result.replace(pattern, `${envKey}=${envs[envKey]}`);
  }, envSharedFileContents.toString());

  const output = additionalEnvKeys.reduce((result, envKey) => {
    return `${result}\n${envKey}=${envs[envKey]}`;
  }, modifiedSharedFile);

  await fs.writeFile(envFileOutputPath, output);

  return { success: true };
}
