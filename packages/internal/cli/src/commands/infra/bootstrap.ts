import { Command } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

export default class InfraBootstrap extends Command {
  static description =
    'Bootstrap infrastructure in AWS account by creating resources necessary to start working with SaaS ' +
    'Boilerplate';

  static examples = [`<%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, {
      requireAws: true,
      validateEnvStageVariables: false,
    });

    await runCommand('pnpm', ['nx', 'run', 'tools:bootstrap-infra']);
    await runCommand('pnpm', ['nx', 'run', 'infra-shared:bootstrap']);
  }
}
