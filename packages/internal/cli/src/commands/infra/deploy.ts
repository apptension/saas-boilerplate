import { Command, Flags, Args } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

enum StackName {
  Global = 'global',
  Main = 'main',
  Db = 'db',
  Functions = 'functions',
  Ci = 'ci',
  Components = 'components',
}

export default class InfraDeploy extends Command {
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
    await initConfig(this, { requireAws: true });

    const verb = flags.diff ? 'diff' : 'deploy';

    if (!args.stackName || args.stackName === StackName.Global) {
      await runCommand('pnpm', ['nx', 'run', `infra-shared:${verb}:global`]);
    }
    if (!args.stackName || args.stackName === StackName.Main) {
      await runCommand('pnpm', ['nx', 'run', `infra-shared:${verb}:main`]);
    }
    if (!args.stackName || args.stackName === StackName.Db) {
      await runCommand('pnpm', ['nx', 'run', `infra-shared:${verb}:db`]);
    }
    if (!args.stackName || args.stackName === StackName.Functions) {
      await runCommand('pnpm', ['nx', 'run', `infra-functions:${verb}`]);
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
