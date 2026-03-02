import { Flags } from '@oclif/core';
import { color } from '@oclif/color';
import { NodeSSH } from 'node-ssh';
import { existsSync, readFileSync } from 'fs';

import { BaseCommand } from '../../baseCommand';
import { getPlatformConfig } from '../../config/platform';

export default class VPSStatus extends BaseCommand<typeof VPSStatus> {
  static description = 'Check status of VPS services';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {
    json: Flags.boolean({ default: false, description: 'JSON output' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(VPSStatus);
    const config = await getPlatformConfig();

    if (!config.vps?.host) {
      this.error(`VPS not configured. Run ${color.cyan('saas vps setup')} first.`);
    }

    const { host, user, port, privateKeyPath, deployPath } = config.vps;

    if (!flags.json) {
      this.log(color.blue('\n📊 VPS Status\n'));
      this.log(`Host: ${color.cyan(`${user}@${host}`)}\n`);
    }

    const ssh = new NodeSSH();

    try {
      const keyPath = privateKeyPath?.startsWith('~')
        ? privateKeyPath.replace('~', process.env.HOME || '')
        : privateKeyPath;

      await ssh.connect({
        host,
        username: user,
        port: port || 22,
        privateKey: keyPath && existsSync(keyPath) ? readFileSync(keyPath, 'utf8') : undefined,
      });

      const result = await ssh.execCommand('docker compose ps --format json', {
        cwd: deployPath || '/opt/saas-app',
      });

      if (result.code !== 0) {
        if (flags.json) {
          this.log(JSON.stringify({ services: [] }));
        } else {
          this.log(color.yellow('No services found. Run saas vps deploy first.'));
        }
        return;
      }

      const services = result.stdout
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          try {
            const parsed = JSON.parse(line);
            return {
              name: parsed.Service || parsed.Name || 'unknown',
              status: parsed.State || parsed.Status || 'unknown',
              ports: parsed.Ports || '',
            };
          } catch {
            return { name: 'unknown', status: 'unknown', ports: '' };
          }
        });

      if (flags.json) {
        this.log(JSON.stringify({ services }, null, 2));
        return;
      }

      this.log('Services:');
      this.log('─'.repeat(60));

      for (const s of services) {
        const icon = s.status.toLowerCase().includes('running') ? '✅' : '❌';
        const statusColor = s.status.toLowerCase().includes('running')
          ? color.green
          : color.red;
        this.log(`${icon} ${s.name.padEnd(20)} ${statusColor(s.status.padEnd(15))} ${s.ports}`);
      }

      this.log('─'.repeat(60) + '\n');

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.error(`Failed to get status: ${msg}`);
    } finally {
      ssh.dispose();
    }
  }
}
