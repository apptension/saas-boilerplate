import { Flags } from '@oclif/core';
import { color } from '@oclif/color';
import { NodeSSH } from 'node-ssh';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

import { BaseCommand } from '../../baseCommand';
import { confirm } from '../../lib/prompts';
import { getPlatformConfig } from '../../config/platform';
import { getRootPath } from '../../config/env';

export default class VPSDeploy extends BaseCommand<typeof VPSDeploy> {
  static description = 'Deploy to VPS using Docker Compose over SSH';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --build',
    '<%= config.bin %> <%= command.id %> --migrate',
  ];

  static flags = {
    build: Flags.boolean({
      char: 'b',
      default: false,
      description: 'Build and push images locally before deploying',
    }),
    migrate: Flags.boolean({
      char: 'm',
      default: false,
      description: 'Run migrations',
    }),
    yes: Flags.boolean({
      char: 'y',
      default: false,
      description: 'Skip confirmation',
    }),
    tag: Flags.string({
      char: 't',
      description: 'Image tag',
      default: 'latest',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(VPSDeploy);
    const config = await getPlatformConfig();

    if (!config.vps?.host) {
      this.error(
        `VPS not configured. Run ${color.cyan('saas vps setup')} first.`,
      );
    }

    const { host, user, port, privateKeyPath, deployPath } = config.vps;

    this.log(color.blue('\n🚀 VPS Deployment\n'));
    this.log(`Target: ${color.cyan(`${user}@${host}:${deployPath}`)}\n`);

    const rootPath = getRootPath();
    const composePath = resolve(rootPath, 'docker-compose.prod.yml');

    if (!existsSync(composePath)) {
      this.error(
        `docker-compose.prod.yml not found. Run ${color.cyan('saas vps setup')} first.`,
      );
    }

    // Build and push images locally if requested
    if (flags.build) {
      await this.buildAndPushImages(rootPath, flags.tag);
    }

    if (!flags.yes) {
      const confirmed = await confirm({
        message: 'Proceed with deployment?',
        default: true,
      });

      if (!confirmed) {
        this.log('Deployment cancelled.');
        return;
      }
    }

    const ssh = new NodeSSH();

    try {
      this.log('⏳ Connecting to VPS...');

      const keyPath = privateKeyPath?.startsWith('~')
        ? privateKeyPath.replace('~', process.env.HOME || '')
        : privateKeyPath;

      await ssh.connect({
        host,
        username: user,
        port: port || 22,
        privateKey:
          keyPath && existsSync(keyPath)
            ? readFileSync(keyPath, 'utf8')
            : undefined,
      });

      this.log(color.green('✓ Connected\n'));

      // Create deploy directory
      await ssh.execCommand(`mkdir -p ${deployPath}`);

      // Upload docker-compose file
      this.log('⏳ Uploading docker-compose.yml...');
      await ssh.putFile(composePath, `${deployPath}/docker-compose.yml`);
      this.log(color.green('✓ Uploaded\n'));

      // Upload .env file if it exists
      const envPath = resolve(rootPath, '.env.prod');
      if (existsSync(envPath)) {
        this.log('⏳ Uploading .env...');
        await ssh.putFile(envPath, `${deployPath}/.env`);
        this.log(color.green('✓ Uploaded .env\n'));
      }

      // Pull images
      this.log('⏳ Pulling Docker images...');
      const pullResult = await ssh.execCommand('docker compose pull', {
        cwd: deployPath,
      });
      if (pullResult.code !== 0) {
        this.log(color.yellow(`⚠ Pull warning: ${pullResult.stderr}`));
      } else {
        this.log(color.green('✓ Images pulled\n'));
      }

      // Deploy
      this.log('⏳ Starting services...');
      const upResult = await ssh.execCommand(
        'docker compose up -d --remove-orphans',
        { cwd: deployPath },
      );
      if (upResult.code !== 0) {
        throw new Error(`Deploy failed: ${upResult.stderr}`);
      }
      this.log(color.green('✓ Services started\n'));

      // Migrations
      if (flags.migrate) {
        this.log('⏳ Running migrations...');
        const migrateResult = await ssh.execCommand(
          'docker compose exec -T backend python manage.py migrate --noinput',
          { cwd: deployPath },
        );
        if (migrateResult.code !== 0) {
          this.log(
            color.yellow(`⚠ Migration warning: ${migrateResult.stderr}`),
          );
        } else {
          this.log(color.green('✓ Migrations complete\n'));
        }
      }

      // Cleanup
      await ssh.execCommand('docker image prune -f');

      this.log(color.green('✅ Deployment complete!\n'));
      this.log(`Check status: ${color.cyan('saas vps status')}\n`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.error(`Deployment failed: ${msg}`);
    } finally {
      ssh.dispose();
    }
  }

  private async buildAndPushImages(
    rootPath: string,
    tag: string,
  ): Promise<void> {
    const config = await getPlatformConfig();

    if (!config.dockerRegistry) {
      this.log(color.yellow('\n⚠️  Docker registry not configured.'));
      this.log('Building images locally for direct use on VPS...\n');

      // Build images without push - they'll need to be on VPS registry or built there
      const images = [
        {
          name: 'backend',
          dockerfile: 'packages/backend/Dockerfile',
          context: 'packages/backend',
        },
        {
          name: 'webapp',
          dockerfile: 'packages/webapp/Dockerfile.prod',
          context: '.',
        },
        {
          name: 'mcp-server',
          dockerfile: 'packages/mcp-server/Dockerfile',
          context: '.',
        },
      ];

      for (const img of images) {
        this.log(`${color.blue(`📦 Building ${img.name}...`)}`);
        execSync(
          `docker build --platform linux/amd64 -f ${img.dockerfile} -t ${img.name}:${tag} ${img.context}`,
          { cwd: rootPath, stdio: 'inherit' },
        );
        this.log(color.green(`✓ Built ${img.name}\n`));
      }

      this.log(color.yellow('⚠️  Images built locally. To push to VPS:'));
      this.log(
        '  1. Set up a Docker registry (docker.io, ghcr.io, or self-hosted)',
      );
      this.log(
        `  2. Run ${color.cyan('saas render setup')} to configure the registry`,
      );
      this.log('  3. Or use docker save/load to transfer images manually\n');
      return;
    }

    const { type, namespace, registry } = config.dockerRegistry;

    let registryPrefix = '';
    if (type === 'ghcr') {
      registryPrefix = 'ghcr.io/';
    } else if (type === 'custom' && registry) {
      registryPrefix = `${registry}/`;
    }

    const images = [
      {
        name: 'backend',
        dockerfile: 'packages/backend/Dockerfile',
        context: 'packages/backend',
        tag: `${registryPrefix}${namespace}-backend:${tag}`,
      },
      {
        name: 'webapp',
        dockerfile: 'packages/webapp/Dockerfile.prod',
        context: '.', // Root context - webapp Dockerfile needs access to root files
        tag: `${registryPrefix}${namespace}-webapp:${tag}`,
      },
      {
        name: 'mcp-server',
        dockerfile: 'packages/mcp-server/Dockerfile',
        context: '.', // Root context - MCP server needs schema from webapp-libs
        tag: `${registryPrefix}${namespace}-mcp-server:${tag}`,
      },
    ];

    for (const img of images) {
      this.log(`${color.blue(`📦 Building ${img.name}...`)}`);
      execSync(
        `docker build --platform linux/amd64 -f ${img.dockerfile} -t ${img.tag} ${img.context}`,
        { cwd: rootPath, stdio: 'inherit' },
      );
      this.log(color.green(`✓ Built ${img.name}`));

      this.log(`${color.blue(`📤 Pushing ${img.name}...`)}`);
      execSync(`docker push ${img.tag}`, { cwd: rootPath, stdio: 'inherit' });
      this.log(color.green(`✓ Pushed ${img.name}\n`));
    }

    this.log(color.green('✓ All images built and pushed\n'));
  }
}
