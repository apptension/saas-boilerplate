import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';
import { color as chalk } from '@oclif/color';

import { initConfig } from '../config/init';
import { runCommandWithOutput } from '../lib/runCommand';
import { assertDockerIsRunning } from '../lib/docker';
import { BaseCommand } from '../baseCommand';
import {
  renderBox,
  colors,
  formatDuration,
  ICONS,
  hideCursor,
  showCursor,
} from '../lib/ui/renderer';
import { printBannerAnimated, renderGradientDivider } from '../lib/ui/banner';
import { getContainerStatuses } from '../lib/ui/healthDashboard';

const exec = promisify(_exec);

interface ContainerInfo {
  name: string;
  displayName: string;
  status: 'running' | 'stopping' | 'stopped';
}

export default class Down extends BaseCommand<typeof Down> {
  static description = 'Stops backend and frontend services';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, { requireLocalEnvStage: true });
    await assertDockerIsRunning();

    const startTime = Date.now();

    // Show animated banner
    await printBannerAnimated({ speed: 8 });

    // Print stopping header
    console.log(renderGradientDivider(60));
    console.log('  ' + chalk.bold('Stopping Development Environment'));
    console.log(renderGradientDivider(60));
    console.log('');

    // Get current running containers
    const statuses = await getContainerStatuses();
    const runningContainers = statuses.filter(
      (s) => s.status === 'running' || s.status === 'starting',
    );

    if (runningContainers.length === 0) {
      console.log(colors.dim('  No running containers found.'));
      console.log('');
      return;
    }

    // Initialize container tracking
    const containers: ContainerInfo[] = runningContainers.map((c) => ({
      name: c.service,
      displayName: c.name,
      status: 'running' as const,
    }));

    // Show initial state
    hideCursor();
    this.renderContainers(containers, 'Stopping services...');

    // Run docker compose down and capture output
    const result = await runCommandWithOutput('docker', ['compose', 'down'], {
      silent: true,
    });

    // Parse output to update container states
    const stoppedContainers = new Set<string>();
    const lines = result.output.split('\n');

    for (const line of lines) {
      // Match lines like "Container saas-boilerplate-backend-1  Removed"
      const match = line.match(/Container\s+(\S+)\s+(?:Stopped|Removed)/i);
      if (match) {
        const containerFullName = match[1].toLowerCase();
        // Extract service name from container name
        for (const container of containers) {
          if (
            containerFullName.includes(container.name.toLowerCase()) ||
            containerFullName.includes(container.name.replace(/_/g, '-').toLowerCase())
          ) {
            container.status = 'stopped';
            stoppedContainers.add(container.name);
          }
        }
      }
    }

    // Mark any remaining as stopped (in case parsing missed some)
    for (const container of containers) {
      if (container.status !== 'stopped') {
        container.status = 'stopped';
      }
    }

    // Clear and render final state
    this.clearLines(containers.length + 2);
    this.renderContainers(containers, 'Stopping services...');

    const duration = Date.now() - startTime;

    // Show completion message
    console.log('');
    console.log(
      `  ${colors.success('All services stopped')}` +
        colors.dim(`                                     Total: ${formatDuration(duration)}`),
    );
    console.log('');

    showCursor();

    // Show error if docker compose failed
    if (result.code !== 0) {
      console.log(colors.error('Some services may not have stopped cleanly:'));
      console.log(colors.dim(result.stderr || result.output));
    }
  }

  private renderContainers(containers: ContainerInfo[], title: string): void {
    console.log(`  ${title}`);

    containers.forEach((container, index) => {
      const isLast = index === containers.length - 1;
      const prefix = isLast ? '└─' : '├─';

      let icon: string;
      let statusText: string;

      switch (container.status) {
        case 'stopped':
          icon = ICONS.success;
          statusText = '';
          break;
        case 'stopping':
          icon = chalk.yellow('○');
          statusText = colors.dim(' stopping...');
          break;
        default:
          icon = chalk.cyan('●');
          statusText = '';
      }

      console.log(`  ${prefix} ${container.displayName.padEnd(18)} ${icon}${statusText}`);
    });
  }

  private clearLines(count: number): void {
    for (let i = 0; i < count; i++) {
      process.stdout.write('\x1B[2K\x1B[1A');
    }
    process.stdout.write('\x1B[2K\r');
  }
}
