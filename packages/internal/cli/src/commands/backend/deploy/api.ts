import { Command, Flags } from '@oclif/core';
import { color } from '@oclif/color';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../../config/init';
import { runCommand } from '../../../lib/runCommand';

const tracer = trace.getTracer('backend');
export default class BackendDeployApi extends Command {
  static description =
    'Deploys backend API to AWS using previously built artifact';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  static flags = {
    diff: Flags.boolean({
      default: false,
      description:
        'Perform a dry run and list all changes that would be applied in AWS account',
      required: false,
    }),
  };

  async run(): Promise<void> {
    return tracer.startActiveSpan('deploy-api', async (span) => {
      const { flags } = await this.parse(BackendDeployApi);
      const { envStage, version, awsRegion, awsAccountId } = await initConfig(
        this,
        { requireAws: true }
      );

      this.log(`Deploying backend:
  envStage: ${color.green(envStage)}
  version: ${color.green(version)}
  AWS account: ${color.green(awsAccountId)}
  AWS region: ${color.green(awsRegion)}
`);

      const verb = flags.diff ? 'diff' : 'deploy';
      await runCommand('pnpm', ['nx', 'run', `backend:${verb}:api`]);
      span.end();
    });
  }
}
