import { initConfig } from '../../config/init';
import { BaseCommand } from '../../baseCommand';

export default class GetEnv extends BaseCommand<typeof GetEnv> {
  static description = 'Get currently selected ENV stage';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    const { envStage } = await initConfig(this, {});
    this.log(envStage);
  }
}
