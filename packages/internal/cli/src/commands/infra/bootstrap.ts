import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

const tracer = trace.getTracer('infra');

export default class InfraBootstrap extends Command {
  static description =
    'Bootstrap infrastructure in AWS account by creating resources necessary to start working with SaaS ' +
    'Boilerplate';

  static examples = [`<%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('bootstrap', async (span) => {
      const { awsAccountId, awsRegion } = await initConfig(this, {
        requireAws: true,
        validateEnvStageVariables: false,
      });

      await runCommand('pnpm', [
        'nx',
        'run',
        'infra-core:cdk',
        'bootstrap',
        `aws://${awsAccountId}/${awsRegion}`,
      ]);
      await runCommand('pnpm', [
        'nx',
        'run',
        'infra-core:cdk',
        'bootstrap',
        `aws://${awsAccountId}/us-east-1`,
      ]);
      await runCommand('pnpm', ['nx', 'run', 'infra-shared:bootstrap']);
      span.end();
    });
  }
}
