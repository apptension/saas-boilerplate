import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertAwsVaultInstalled } from '../../lib/awsVault';

const tracer = trace.getTracer('aws');
export default class AwsLogin extends Command {
  static description = 'Get currently selected ENV stage';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('login', async (span) => {
      await initConfig(this, { requireAws: true });
      await assertAwsVaultInstalled();

      await runCommand('aws-vault', ['login']);
      span.end();
    });
  }
}
