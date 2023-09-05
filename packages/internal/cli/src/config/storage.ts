import * as storage from 'node-persist';
import * as childProcess from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';

import { ENV_STAGE_LOCAL } from './env';

let isStorageInitialized = false;

const exec = promisify(childProcess.exec);

export const getEnvStageKey = () => `${process.ppid}-envStage`;

export const getConfigStorage = async () => {
  if (!isStorageInitialized) {
    const { stdout } = await exec('pnpm root -w');
    const dir = resolve(stdout, '..', '.saas-boilerplate');
    await storage.init({ encoding: 'utf-8', dir });
    isStorageInitialized = false;
  }
  return storage;
};

export const getEnvStage = async (): Promise<string> => {
  const storage = await getConfigStorage();
  return (await storage.getItem(getEnvStageKey())) ?? ENV_STAGE_LOCAL;
};

export const setEnvStage = async (value: string) => {
  const storage = await getConfigStorage();
  await storage.setItem(getEnvStageKey(), value);
};
