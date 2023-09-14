import { initConfig } from '../../../config/init';
import { runCommand } from '../../../lib/runCommand';
import { BaseCommand } from '../../../baseCommand';

export default class WebappGraphqlDownloadSchema extends BaseCommand<
  typeof WebappGraphqlDownloadSchema
> {
  static description = 'Download graphql schemas and merge them';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, {});

    await runCommand('pnpm', ['nx', 'run', 'webapp:graphql:download-schema']);
  }
}
