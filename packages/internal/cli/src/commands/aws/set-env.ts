import { Args, Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { setEnvStage } from '../../config/storage';
import { initConfig } from '../../config/init';

const tracer = trace.getTracer('aws');
export default class SetEnv extends Command {
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
    return tracer.startActiveSpan('set-env', async (span) => {
      const { args, flags } = await this.parse(SetEnv);
      const { envStage: currentEnvStage } = await initConfig(this, {});

      if (currentEnvStage === args.envStage) {
        this.log(`Your environment stage is already set to ${args.envStage}.`);
        return;
      }

      await setEnvStage(args.envStage);
      this.log(`Switched environment stage to ${args.envStage}.`);
      span.end();
    });
  }
}
