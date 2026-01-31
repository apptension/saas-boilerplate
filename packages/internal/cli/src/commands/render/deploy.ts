import { Flags } from '@oclif/core';
import { color } from '@oclif/color';
import { execSync } from 'child_process';

import { BaseCommand } from '../../baseCommand';
import { checkbox, confirm, select } from '../../lib/prompts';
import { getPlatformConfig } from '../../config/platform';
import { RenderApiClient, RenderService, getDeployStatusEmoji } from '../../lib/renderApi';
import { getRootPath } from '../../config/env';

interface ImageBuild {
  name: string;
  dockerfile: string;
  context: string;
  tag: string;
}

export default class RenderDeploy extends BaseCommand<typeof RenderDeploy> {
  static description = 'Deploy services to Render.com';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --local',
    '<%= config.bin %> <%= command.id %> --all',
    '<%= config.bin %> <%= command.id %> --service=backend-api',
  ];

  static flags = {
    local: Flags.boolean({
      char: 'l',
      default: false,
      description: 'Build and deploy local code (requires Docker registry setup)',
    }),
    all: Flags.boolean({ char: 'a', default: false, description: 'Deploy all services' }),
    service: Flags.string({ char: 's', description: 'Service name or ID', multiple: true }),
    'clear-cache': Flags.boolean({ default: false, description: 'Clear build cache' }),
    yes: Flags.boolean({ char: 'y', default: false, description: 'Skip confirmation' }),
    wait: Flags.boolean({ char: 'w', default: true, description: 'Wait for completion' }),
    tag: Flags.string({ char: 't', description: 'Image tag (default: latest)', default: 'latest' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(RenderDeploy);
    const config = await getPlatformConfig();

    if (!config.render?.apiKey) {
      this.error(`Render.com is not configured. Run ${color.cyan('saas render setup')} first.`);
    }

    if (flags.local) {
      await this.deployLocal(flags);
    } else {
      await this.deployFromRepo(flags);
    }
  }

  private async deployLocal(flags: {
    yes: boolean;
    tag: string;
    wait: boolean;
  }): Promise<void> {
    const config = await getPlatformConfig();

    if (!config.dockerRegistry) {
      this.log(color.yellow('\n⚠️  Docker registry not configured.\n'));
      this.log(`Run ${color.cyan('saas render setup')} and configure a Docker registry.\n`);
      return;
    }

    const { type, namespace, registry } = config.dockerRegistry;
    const rootPath = getRootPath();

    // Determine registry prefix
    let registryPrefix = '';
    if (type === 'ghcr') {
      registryPrefix = 'ghcr.io/';
    } else if (type === 'custom' && registry) {
      registryPrefix = `${registry}/`;
    }

    const tag = flags.tag;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fullTag = tag === 'latest' ? `${tag}-${timestamp}` : tag;

    const images: ImageBuild[] = [
      {
        name: 'backend',
        dockerfile: 'packages/backend/Dockerfile',
        context: 'packages/backend',
        tag: `${registryPrefix}${namespace}-backend:${fullTag}`,
      },
      {
        name: 'webapp',
        dockerfile: 'packages/webapp/Dockerfile.prod',
        context: '.', // Root context - webapp Dockerfile needs access to root files
        tag: `${registryPrefix}${namespace}-webapp:${fullTag}`,
      },
      {
        name: 'mcp-server',
        dockerfile: 'packages/infra/mcp-server/Dockerfile',
        context: '.', // Root context - MCP server needs schema from webapp-libs
        tag: `${registryPrefix}${namespace}-mcp-server:${fullTag}`,
      },
    ];

    this.log(color.blue('\n🚀 Local Deployment to Render.com\n'));
    this.log('This will:');
    this.log('  1. Build Docker images locally');
    this.log('  2. Push images to your registry');
    this.log('  3. Create/update Render services with those images\n');

    this.log('Images to build:');
    images.forEach((img) => this.log(`  • ${color.cyan(img.tag)}`));

    if (!flags.yes) {
      const confirmed = await confirm({
        message: 'Continue with local deployment?',
        default: true,
      });

      if (!confirmed) {
        this.log('Deployment cancelled.');
        return;
      }
    }

    // Build and push images
    for (const img of images) {
      this.log(`\n${color.blue(`📦 Building ${img.name}...`)}`);

      try {
        execSync(
          `docker build --platform linux/amd64 -f ${img.dockerfile} -t ${img.tag} ${img.context}`,
          { cwd: rootPath, stdio: 'inherit' }
        );
        this.log(color.green(`✓ Built ${img.name}`));

        this.log(`${color.blue(`📤 Pushing ${img.name}...`)}`);
        execSync(`docker push ${img.tag}`, { cwd: rootPath, stdio: 'inherit' });
        this.log(color.green(`✓ Pushed ${img.name}`));
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        this.error(`Failed to build/push ${img.name}: ${msg}`);
      }
    }

    // Now create or update Render services
    await this.createOrUpdateRenderServices(images, config.render!.apiKey, config.render!.ownerId);
  }

  private async createOrUpdateRenderServices(
    images: ImageBuild[],
    apiKey: string,
    ownerId?: string
  ): Promise<void> {
    const client = new RenderApiClient(apiKey);
    const services = await client.getServices(ownerId);

    this.log(color.blue('\n🔄 Updating Render services...\n'));

    if (services.length === 0) {
      this.log(color.yellow('No existing services found on Render.'));
      this.log('\nTo deploy image-backed services, you need to create them first in the Render dashboard:');
      this.log('  1. Go to https://dashboard.render.com/new/web-service');
      this.log('  2. Select "Existing Image" as the source');
      this.log('  3. Enter your image URL:');
      images.forEach((img) => this.log(`     ${color.cyan(img.tag)}`));
      this.log('\nAfter creating the services, run this command again to trigger deployments.\n');
      return;
    }

    // Find matching services and trigger deploys
    for (const img of images) {
      const matchingService = services.find(
        (s) => s.name.includes(img.name) || s.name.toLowerCase().includes(img.name)
      );

      if (matchingService) {
        try {
          this.log(`⏳ Triggering deploy for ${color.cyan(matchingService.name)}...`);
          await client.triggerDeploy(matchingService.id, true);
          this.log(`   ${color.green('✓')} Deploy triggered`);
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          this.log(`   ${color.red('✗')} Failed: ${msg}`);
        }
      } else {
        this.log(`   ${color.yellow('⚠')} No matching service found for ${img.name}`);
      }
    }

    this.log(color.green('\n✅ Local deployment complete!\n'));
    this.log(`Check status: ${color.cyan('saas render status')}\n`);
  }

  private async deployFromRepo(flags: {
    all: boolean;
    service?: string[];
    'clear-cache': boolean;
    yes: boolean;
    wait: boolean;
  }): Promise<void> {
    const config = await getPlatformConfig();
    const client = new RenderApiClient(config.render!.apiKey);

    this.log(color.blue('\n🚀 Render.com Deployment\n'));

    const services = await client.getServices(config.render!.ownerId);

    if (services.length === 0) {
      this.log(color.yellow('No services found.'));
      this.log('\nOptions:');
      this.log(`  • ${color.cyan('saas render deploy --local')} - Deploy local code via Docker`);
      this.log('  • Connect your repo in Render Dashboard');
      this.log('  • Use the render.yaml blueprint\n');
      return;
    }

    let servicesToDeploy: RenderService[] = [];

    if (flags.all) {
      servicesToDeploy = services;
    } else if (flags.service?.length) {
      for (const ref of flags.service) {
        const found = services.find((s) => s.name === ref || s.id === ref);
        if (found) servicesToDeploy.push(found);
        else this.warn(`Service not found: ${ref}`);
      }
    } else {
      const selectedIds = await checkbox({
        message: 'Select services to deploy:',
        choices: services.map((s) => ({ value: s.id, name: `${s.name} (${s.type})`, checked: true })),
      });
      servicesToDeploy = services.filter((s) => selectedIds.includes(s.id));
    }

    if (servicesToDeploy.length === 0) {
      this.log('No services selected.');
      return;
    }

    if (!flags.yes) {
      this.log('\nServices to deploy:');
      servicesToDeploy.forEach((s) => this.log(`  • ${s.name}`));

      const confirmed = await confirm({
        message: `Deploy ${servicesToDeploy.length} service(s)?`,
        default: true,
      });

      if (!confirmed) {
        this.log('Deployment cancelled.');
        return;
      }
    }

    this.log('');
    const results: Array<{ service: RenderService; deployId: string }> = [];

    for (const service of servicesToDeploy) {
      try {
        this.log(`⏳ Deploying ${color.cyan(service.name)}...`);
        const deploy = await client.triggerDeploy(service.id, flags['clear-cache']);
        results.push({ service, deployId: deploy.id });
        this.log(`   ${color.green('✓')} Triggered (ID: ${deploy.id})`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        this.log(`   ${color.red('✗')} Failed: ${msg}`);
      }
    }

    if (flags.wait && results.length > 0) {
      this.log(color.blue('\n⏳ Waiting for deployments...\n'));

      const pending = new Set(results.map((r) => r.service.id));
      const maxWait = 30 * 60 * 1000;
      const start = Date.now();

      while (pending.size > 0 && Date.now() - start < maxWait) {
        for (const r of results) {
          if (!pending.has(r.service.id)) continue;

          try {
            const deploy = await client.getDeploy(r.service.id, r.deployId);
            const emoji = getDeployStatusEmoji(deploy.status);
            this.log(`${emoji} ${r.service.name}: ${deploy.status}`);

            if (['live', 'build_failed', 'update_failed', 'canceled'].includes(deploy.status)) {
              pending.delete(r.service.id);
            }
          } catch { /* ignore */ }
        }

        if (pending.size > 0) {
          await new Promise((resolve) => setTimeout(resolve, 10000));
          this.log('');
        }
      }

      this.log(pending.size > 0
        ? color.yellow('\n⚠️  Some deployments still in progress.')
        : color.green('\n✅ All deployments completed!'));
    } else {
      this.log(color.blue('\n✓ Deployments triggered!\n'));
    }
  }
}
