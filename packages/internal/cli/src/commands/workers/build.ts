import { Command, Flags } from '@oclif/core';
import { color } from '@oclif/color';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { dockerHubLogin } from '../../lib/docker';

const tracer = trace.getTracer('workers');
export default class WorkersBuild extends Command {
  static description = 'Build workers artifact ready to be deployed to AWS';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('build', async (span) => {
      const { envStage, version, awsAccountId, awsRegion } = await initConfig(
        this,
        { requireAws: true }
      );
      await dockerHubLogin();

      this.log(`Deploying backend:
  envStage: ${color.green(envStage)}
  version: ${color.green(version)}
  AWS account: ${color.green(awsAccountId)}
  AWS region: ${color.green(awsRegion)}
`);

      await runCommand('pnpm', ['nx', 'run', `workers:build`]);
      span.end();
    });
  }
}
