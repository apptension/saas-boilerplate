import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../../config/init';
import { runCommand } from '../../../lib/runCommand';

const tracer = trace.getTracer('webapp');
export default class WebappGraphqlDownloadSchema extends Command {
  static description = 'Download graphql schemas and merge them';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('graphql:download-schema', async (span) => {
      await initConfig(this, {});

      await runCommand('pnpm', ['nx', 'run', 'webapp:graphql:download-schema']);
      span.end();
    });
  }
}
