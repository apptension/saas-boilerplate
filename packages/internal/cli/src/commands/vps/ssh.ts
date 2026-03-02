import { Flags } from '@oclif/core';
import { color } from '@oclif/color';
import { spawn } from 'child_process';

import { BaseCommand } from '../../baseCommand';
import { getPlatformConfig } from '../../config/platform';

export default class VPSSSH extends BaseCommand<typeof VPSSSH> {
  static description = 'SSH into the configured VPS';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --command="docker ps"',
  ];

  static flags = {
    command: Flags.string({ char: 'c', description: 'Command to execute' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(VPSSSH);
    const config = await getPlatformConfig();

    if (!config.vps?.host) {
      this.error(`VPS not configured. Run ${color.cyan('saas vps setup')} first.`);
    }

    const { host, user, port, privateKeyPath } = config.vps;

    const sshArgs: string[] = [];

    if (port && port !== 22) {
      sshArgs.push('-p', port.toString());
    }

    if (privateKeyPath) {
      const keyPath = privateKeyPath.startsWith('~')
        ? privateKeyPath.replace('~', process.env.HOME || '')
        : privateKeyPath;
      sshArgs.push('-i', keyPath);
    }

    sshArgs.push(`${user}@${host}`);

    if (flags.command) {
      sshArgs.push(flags.command);
      this.log(color.blue(`\n🔗 Executing on ${host}...\n`));
    } else {
      this.log(color.blue(`\n🔗 Connecting to ${host}...\n`));
    }

    const ssh = spawn('ssh', sshArgs, { stdio: 'inherit' });

    await new Promise<void>((resolve) => {
      ssh.on('close', () => resolve());
    });
  }
}
