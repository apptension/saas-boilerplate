import { Args, Command } from '@oclif/core';

import { ConfOptions, getConfigStorage } from '../config';

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
    await storage.setItem(ConfOptions.EnvStage, args.envStage);

    this.log(`hello ${args.envStage}`);
  }
}
