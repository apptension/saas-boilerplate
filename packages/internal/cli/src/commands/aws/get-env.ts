import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';

const tracer = trace.getTracer('aws');
export default class GetEnv extends Command {
  static description = 'Get currently selected ENV stage';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('get-env', async (span) => {
      const { envStage } = await initConfig(this, {});
      this.log(envStage);
      span.end();
    });
  }
}
