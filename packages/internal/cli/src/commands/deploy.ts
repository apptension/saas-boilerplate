import { Flags } from '@oclif/core';
import { color } from '@oclif/color';

import { initConfig } from '../config/init';
import { runCommand } from '../lib/runCommand';
import { BaseCommand } from '../baseCommand';
import { select, confirm } from '../lib/prompts';
import {
  getPlatformConfig,
  PlatformType,
  AVAILABLE_PLATFORMS,
  getPlatformDisplayName,
  getPlatformDescription,
} from '../config/platform';

export default class Deploy extends BaseCommand<typeof Deploy> {
  static description =
    'Deploy to AWS, Render.com, or VPS. Interactive platform selection by default.';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --platform=aws',
    '<%= config.bin %> <%= command.id %> --platform=render',
    '<%= config.bin %> <%= command.id %> --platform=vps',
    '<%= config.bin %> <%= command.id %> --diff',
  ];

  static flags = {
    platform: Flags.string({
      char: 'p',
      description: 'Target deployment platform (aws, render, vps)',
      options: AVAILABLE_PLATFORMS,
      required: false,
    }),
    diff: Flags.boolean({
      default: false,
      description: 'Perform a dry run (AWS only)',
      required: false,
    }),
    yes: Flags.boolean({
      char: 'y',
      default: false,
      description: 'Skip confirmation prompts',
      required: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Deploy);
    let platform = flags.platform as PlatformType | undefined;

    // If no platform specified, show interactive selection
    if (!platform) {
      const config = await getPlatformConfig();

      // Check if there's a default platform configured
      if (config.defaultPlatform && flags.yes) {
        platform = config.defaultPlatform;
        this.log(`Using default platform: ${getPlatformDisplayName(platform)}`);
      } else {
        platform = await select<PlatformType>({
          message: 'Select deployment platform:',
          choices: AVAILABLE_PLATFORMS.map((p) => ({
            value: p,
            name: `${getPlatformDisplayName(p)} - ${getPlatformDescription(p)}`,
          })),
          default: config.defaultPlatform,
        });
      }
    }

    // Confirm deployment
    if (!flags.yes && !flags.diff) {
      const confirmed = await confirm({
        message: `Deploy to ${color.cyan(getPlatformDisplayName(platform))}?`,
        default: true,
      });

      if (!confirmed) {
        this.log('Deployment cancelled.');
        return;
      }
    }

    // Route to appropriate deployment handler
    switch (platform) {
      case 'aws':
        await this.deployToAWS(flags.diff);
        break;
      case 'render':
        await this.deployToRender();
        break;
      case 'vps':
        await this.deployToVPS();
        break;
      default:
        this.error(`Platform ${platform} is not yet supported.`);
    }
  }

  private async deployToAWS(diff: boolean): Promise<void> {
    await initConfig(this, { requireAws: true });

    const verb = diff ? 'diff' : 'deploy';
    this.log(color.blue(`\n🚀 ${diff ? 'Showing changes' : 'Deploying'} to AWS...\n`));

    await runCommand('pnpm', [
      'nx',
      'run-many',
      '--output-style=stream',
      `--target=${verb}`,
      '--projects=backend,workers,webapp',
    ]);

    if (!diff) {
      this.log(color.green('\n✅ AWS deployment completed!\n'));
    }
  }

  private async deployToRender(): Promise<void> {
    const config = await getPlatformConfig();

    if (!config.render?.apiKey) {
      this.log(color.yellow('\n⚠️  Render.com is not configured yet.\n'));
      this.log(`Run ${color.cyan('saas render setup')} to configure your API key.\n`);
      return;
    }

    // Delegate to render deploy command
    await runCommand('pnpm', ['saas', 'render', 'deploy', '--yes']);
  }

  private async deployToVPS(): Promise<void> {
    const config = await getPlatformConfig();

    if (!config.vps?.host) {
      this.log(color.yellow('\n⚠️  VPS is not configured yet.\n'));
      this.log(`Run ${color.cyan('saas vps setup')} to configure your VPS connection.\n`);
      return;
    }

    // Delegate to vps deploy command
    await runCommand('pnpm', ['saas', 'vps', 'deploy', '--yes']);
  }
}
