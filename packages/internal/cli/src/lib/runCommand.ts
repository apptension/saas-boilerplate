import {SpawnOptionsWithoutStdio, spawn } from 'node:child_process';

export function runCommand(command: string, args: string[], options?: SpawnOptionsWithoutStdio) {
  return new Promise<void>((resolve, reject) => {
    const cmd = spawn(command, args, {
      shell: process.platform === 'win32',
      stdio: 'inherit',
      ...options
    });

    cmd.on('close', (code) => {
      if (code !== 0) {
        reject(
          new Error(`"${command} ${args.join(' ')}" failed with code ${code}`)
        );
      } else {
        resolve();
      }
    });
  });
}
