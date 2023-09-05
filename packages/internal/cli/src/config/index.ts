import * as storage from 'node-persist';
import * as childProcess from 'child_process';
import {promisify} from 'util';
import {resolve} from 'path';

const exec = promisify(childProcess.exec);

export const getEnvStageKey = () => `${process.ppid}-envStage`;

export const getConfigStorage = async () => {
  const { stdout } = await exec('pnpm root -w');
  const dir = resolve(stdout, '..', '.saas-boilerplate');
  await storage.init({ encoding: 'utf-8', dir });
  return storage;
};
