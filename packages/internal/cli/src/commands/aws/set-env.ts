import { Args } from '@oclif/core';

import { setEnvStage } from '../../config/storage';
import { initConfig } from '../../config/init';
import { BaseCommand } from '../../baseCommand';

export default class SetEnv extends BaseCommand<typeof SetEnv> {
  static description = 'Select ENV stage';

  static examples = [
    `$ <%= config.bin %> <%= command.id %> local`,
    `$ <%= config.bin %> <%= command.id %> qa`,
    `$ <%= config.bin %> <%= command.id %> staging`,
    `$ <%= config.bin %> <%= command.id %> production`,
  ];

  static args = {
    envStage: Args.string({
      description: 'Env stage to select',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(SetEnv);
    const { envStage: currentEnvStage } = await initConfig(this, {});

    if (currentEnvStage === args.envStage) {
      this.log(`Your environment stage is already set to ${args.envStage}.`);
      return;
    }

    await setEnvStage(args.envStage);
    this.log(`Switched environment stage to ${args.envStage}.`);
  }
}
