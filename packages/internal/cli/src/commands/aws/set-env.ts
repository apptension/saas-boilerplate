import { Args, Command } from '@oclif/core';

import { setEnvStage } from '../../config/storage';
import { initConfig } from '../../config/init';

export default class SetEnv extends Command {
  static description = 'Select ENV stage';

  static examples = [`$ <%= config.bin %> <%= command.id %> qa`];

  static args = {
    envStage: Args.string({
      description: 'Env stage to select',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(SetEnv);
    const { envStage: currentEnvStage } = await initConfig(this, {});

    if (currentEnvStage === args.envStage) {
      this.log(`Your environment stage is already set to ${args.envStage}.`);
      return;
    }

    await setEnvStage(args.envStage);
    this.log(`Switched environment stage to ${args.envStage}.`);
  }
}
