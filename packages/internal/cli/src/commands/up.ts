import { Command } from '@oclif/core';
import { initConfig } from '../config/init';
import { runCommand } from '../lib/runCommand';

export default class Up extends Command {
  static description = 'Starts both backend and frontend';

  static examples = [`$ saas up`];

  async run(): Promise<void> {
    await initConfig(this, { requireLocalEnvStage: true });

    await runCommand('pnpm', ['nx', 'run', 'core:docker-compose:up']);
    await runCommand('pnpm', ['nx', 'run', 'webapp:start']);
  }
}
