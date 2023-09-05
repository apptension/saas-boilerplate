import { Command } from '@oclif/core';

import { getConfigStorage, getEnvStageKey } from '../config/storage';
import { initConfig } from '../config/init';

export default class GetEnv extends Command {
  static description = 'Get currently selected ENV stage';

  static examples = [`$ saas get-env`];

  async run(): Promise<void> {
    const { envStage } = await initConfig(this, {});
    this.log(envStage);
  }
}
