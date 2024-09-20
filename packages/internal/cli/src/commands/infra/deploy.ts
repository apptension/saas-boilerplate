import { Args, Flags } from '@oclif/core';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { BaseCommand } from '../../baseCommand';

enum StackName {
  Global = 'global',
  Main = 'main',
  Db = 'db',
  Ci = 'ci',
  Components = 'components',
}

export default class InfraDeploy extends BaseCommand<typeof InfraDeploy> {
  static description =
    'Deploy infrastructure of a currently selected environment stage to AWS account';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  static flags = {
    diff: Flags.boolean({
      default: false,
      description:
        'Perform a dry run and list all changes that would be applied',
      required: false,
    }),
  };

  static args = {
    stackName: Args.string({
      description:
        'Name of the stack to deploy. If not specified all will be deployed',
      required: false,
      options: Object.values(StackName),
    }),
  };

  async run(): Promise<void> {
    const { flags, args } = await this.parse(InfraDeploy);
    const { projectName } = await initConfig(this, { requireAws: true });

    const lambdaClient = new LambdaClient();

    const verb = flags.diff ? 'diff' : 'deploy';

    if (!args.stackName || args.stackName === StackName.Global) {
      await runCommand('pnpm', ['nx', 'run', `infra-shared:${verb}:global`]);
      if (verb === 'deploy') {
        const functionName = `${projectName}-ecr-sync-get-image-tags`;
        this.log(
          `Invoking ${functionName} lambda function to trigger docker hub mirror synchronisation`,
        );
        await lambdaClient.send(
          new InvokeCommand({
            FunctionName: functionName,
          }),
        );
      }
    }
    if (!args.stackName || args.stackName === StackName.Main) {
      await runCommand('pnpm', ['nx', 'run', `infra-shared:${verb}:main`]);
    }
    if (!args.stackName || args.stackName === StackName.Db) {
      await runCommand('pnpm', ['nx', 'run', `infra-shared:${verb}:db`]);
    }
    if (!args.stackName || args.stackName === StackName.Ci) {
      await runCommand('pnpm', ['nx', 'run', `infra-shared:${verb}:ci`]);
    }
    if (!args.stackName || args.stackName === StackName.Components) {
      await runCommand('pnpm', [
        'nx',
        'run',
        `infra-shared:${verb}:components`,
      ]);
    }
  }
}
