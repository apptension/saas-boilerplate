import { Args, Command } from '@oclif/core';

import { getConfigStorage, getEnvStageKey } from '../config';

export default class SetEnv extends Command {
  static description = 'Select ENV stage';

  static examples = [`$ saas set-env qa`];

  static args = {
    envStage: Args.string({
      description: 'Env stage to select',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(SetEnv);
    const storage = await getConfigStorage();
    const envStageKey = getEnvStageKey();
    const currentEnvStage = await storage.getItem(envStageKey);

    if (currentEnvStage === args.envStage) {
      this.log(`Your environment stage is already set to ${args.envStage}.`);
      return;
    }
    await storage.setItem(envStageKey, args.envStage);
    this.log(`Switched environment stage to ${args.envStage}.`);
  }
}
