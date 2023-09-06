import { Command } from '@oclif/core';
import { initConfig } from '../../config/init';

export default class GetEnv extends Command {
  static description = 'Get currently selected ENV stage';

  static examples = [`$ saas aws get-env`];

  async run(): Promise<void> {
    const { envStage } = await initConfig(this, {});
    this.log(envStage);
  }
}
