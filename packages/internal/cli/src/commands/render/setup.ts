import { color } from '@oclif/color';

import { BaseCommand } from '../../baseCommand';
import { password, select, confirm } from '../../lib/prompts';
import {
  getPlatformConfig,
  updatePlatformConfig,
  RenderConfig,
  DockerRegistryConfig,
} from '../../config/platform';
import { RenderApiClient } from '../../lib/renderApi';

export default class RenderSetup extends BaseCommand<typeof RenderSetup> {
  static description = 'Configure Render.com API access for deployments';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  async run(): Promise<void> {
    this.log(color.blue('\n🔧 Render.com Setup\n'));

    this.log('To deploy to Render.com, you need an API key.');
    this.log('Get your API key from: https://dashboard.render.com/u/settings#api-keys\n');

    const existingConfig = await getPlatformConfig();

    if (existingConfig.render?.apiKey) {
      const overwrite = await confirm({
        message: 'Render.com is already configured. Overwrite?',
        default: false,
      });

      if (!overwrite) {
        this.log('Setup cancelled.');
        return;
      }
    }

    const apiKey = await password({
      message: 'Enter your Render.com API key:',
      mask: '*',
      validate: (value) => {
        if (!value || value.length < 10) return 'Please enter a valid API key';
        return true;
      },
    });

    this.log('\nValidating API key...');
    const client = new RenderApiClient(apiKey);

    try {
      const owners = await client.getOwners();

      if (owners.length === 0) {
        this.error('No owners found. Please check your API key permissions.');
      }

      this.log(color.green('✓ API key is valid!\n'));

      let ownerId: string | undefined;
      if (owners.length === 1) {
        ownerId = owners[0].id;
        this.log(`Using owner: ${color.cyan(owners[0].name)} (${owners[0].type})`);
      } else {
        ownerId = await select({
          message: 'Select the owner/team for deployments:',
          choices: owners.map((o) => ({ value: o.id, name: `${o.name} (${o.type})` })),
        });
      }

      const services = await client.getServices(ownerId);
      if (services.length > 0) {
        this.log(`\nFound ${color.cyan(services.length.toString())} existing services:`);
        services.slice(0, 5).forEach((s) => {
          const status = s.suspended === 'suspended' ? '⏸️' : '✅';
          this.log(`  ${status} ${s.name} (${s.type})`);
        });
        if (services.length > 5) this.log(`  ... and ${services.length - 5} more`);
      }

      const renderConfig: RenderConfig = { apiKey, ownerId };
      await updatePlatformConfig({ render: renderConfig });

      const setDefault = await confirm({
        message: 'Set Render.com as your default deployment platform?',
        default: false,
      });

      if (setDefault) {
        await updatePlatformConfig({ defaultPlatform: 'render' });
        this.log(color.green('\n✓ Render.com set as default platform'));
      }

      // Docker registry setup for local deployments
      const setupRegistry = await confirm({
        message: 'Configure Docker registry for local image deployments?',
        default: services.length === 0, // Default yes if no services exist
      });

      if (setupRegistry) {
        await this.setupDockerRegistry();
      }

      this.log(color.green('\n✅ Render.com setup complete!\n'));
      this.log('You can now use:');
      this.log(`  ${color.cyan('saas render deploy')}         - Deploy from connected repo`);
      this.log(`  ${color.cyan('saas render deploy --local')} - Build & deploy local code`);
      this.log(`  ${color.cyan('saas render status')}         - Check service status`);
      this.log(`  ${color.cyan('saas deploy')}                - Interactive deployment\n`);

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.error(`Failed to validate API key: ${msg}`);
    }
  }

  private async setupDockerRegistry(): Promise<void> {
    this.log(color.blue('\n📦 Docker Registry Setup\n'));
    this.log('To deploy local code, images need to be pushed to a container registry.\n');

    const registryType = await select<'dockerhub' | 'ghcr' | 'custom'>({
      message: 'Select container registry:',
      choices: [
        { value: 'dockerhub', name: 'Docker Hub (docker.io)' },
        { value: 'ghcr', name: 'GitHub Container Registry (ghcr.io)' },
        { value: 'custom', name: 'Custom registry' },
      ],
    });

    let registry: string | undefined;
    if (registryType === 'custom') {
      registry = await (await import('../../lib/prompts')).input({
        message: 'Registry URL (e.g., registry.example.com):',
        validate: (v) => (v ? true : 'Required'),
      });
    }

    const { input } = await import('../../lib/prompts');

    const username = await input({
      message: registryType === 'ghcr'
        ? 'GitHub username or organization:'
        : 'Registry username:',
      validate: (v) => (v ? true : 'Required'),
    });

    const namespace = await input({
      message: 'Image namespace/prefix (e.g., mycompany/saas):',
      default: `${username}/saas-boilerplate`,
    });

    this.log(color.yellow('\n⚠️  Important: Docker credentials'));
    this.log('You need to log in to your registry before deploying:\n');

    if (registryType === 'dockerhub') {
      this.log(`  ${color.cyan('docker login')}`);
    } else if (registryType === 'ghcr') {
      this.log(`  ${color.cyan('echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin')}`);
    } else {
      this.log(`  ${color.cyan(`docker login ${registry}`)}`);
    }

    const registryConfig: DockerRegistryConfig = {
      type: registryType,
      username,
      namespace,
      registry,
    };

    await updatePlatformConfig({ dockerRegistry: registryConfig });
    this.log(color.green('\n✓ Docker registry configured'));
  }
}
