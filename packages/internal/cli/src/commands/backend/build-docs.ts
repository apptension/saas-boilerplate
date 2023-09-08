import { Command } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import {dockerHubLogin} from "../../lib/docker";

export default class BackendBuild extends Command {
  static description = 'Build backend docs and put results into docs package';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, {});
    await dockerHubLogin();

    await runCommand('pnpm', ['nx', 'run', 'backend:build-docs']);
  }
}
