import * as childProcess from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import * as dotenv from 'dotenv';

export const ENV_STAGE_LOCAL = 'local';

const exec = promisify(childProcess.exec);
export const loadDotenv = async () => {
  const { stdout } = await exec('pnpm root -w');
  dotenv.config({ path: resolve(stdout, '..', '.env') });
};
