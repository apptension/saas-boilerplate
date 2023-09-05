import { Command } from '@oclif/core';

import { getConfigStorage, getEnvStageKey } from '../config';

export default class GetEnv extends Command {
  static description = 'Get currently selected ENV stage';

  static examples = [`$ saas get-env`];

  async run(): Promise<void> {
    await this.parse(GetEnv);
    const storage = await getConfigStorage();
    const envStageKey = getEnvStageKey();
    const currentEnvStage = (await storage.getItem(envStageKey)) ?? 'none';

    this.log(currentEnvStage);
  }
}
