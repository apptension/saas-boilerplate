import { Flags } from '@oclif/core';
import { color } from '@oclif/color';

import { BaseCommand } from '../../baseCommand';
import { getPlatformConfig } from '../../config/platform';
import { RenderApiClient, getDeployStatusEmoji } from '../../lib/renderApi';

export default class RenderStatus extends BaseCommand<typeof RenderStatus> {
  static description = 'Check status of Render.com services';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --deploys',
  ];

  static flags = {
    service: Flags.string({ char: 's', description: 'Service name or ID' }),
    deploys: Flags.boolean({ char: 'd', default: false, description: 'Show recent deploys' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(RenderStatus);
    const config = await getPlatformConfig();

    if (!config.render?.apiKey) {
      this.error(`Render.com is not configured. Run ${color.cyan('saas render setup')} first.`);
    }

    const client = new RenderApiClient(config.render.apiKey);
    this.log(color.blue('\n📊 Render.com Status\n'));

    const services = await client.getServices(config.render.ownerId);

    if (services.length === 0) {
      this.log(color.yellow('No services found.'));
      return;
    }

    const filtered = flags.service
      ? services.filter((s) => s.name === flags.service || s.id === flags.service)
      : services;

    if (filtered.length === 0) {
      this.error(`Service not found: ${flags.service}`);
    }

    for (const service of filtered) {
      const statusIcon = service.suspended === 'suspended' ? '⏸️' : '✅';
      const statusText = service.suspended === 'suspended'
        ? color.yellow('suspended')
        : color.green('active');

      this.log(`${statusIcon} ${color.bold(service.name)}`);
      this.log(`   Type: ${service.type}`);
      this.log(`   Status: ${statusText}`);
      if (service.serviceDetails.url) {
        this.log(`   URL: ${color.cyan(service.serviceDetails.url)}`);
      }

      if (flags.deploys) {
        try {
          const deploys = await client.getDeploys(service.id, 3);
          if (deploys.length > 0) {
            this.log('   Recent deploys:');
            for (const d of deploys) {
              const emoji = getDeployStatusEmoji(d.status);
              const date = new Date(d.createdAt).toLocaleString();
              this.log(`     ${emoji} ${d.status} - ${date}`);
            }
          }
        } catch { /* ignore */ }
      }

      this.log('');
    }
  }
}
