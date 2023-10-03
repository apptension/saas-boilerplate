import { SpawnOptionsWithoutStdio, spawn } from 'node:child_process';

type RunCommandOptions = SpawnOptionsWithoutStdio & {
  silent?: boolean;
};

export function runCommand(
  command: string,
  args: string[],
  options?: RunCommandOptions,
) {
  return new Promise<void>((resolve, reject) => {
    if (!options?.silent) {
      console.log([command, ...args].join(' '));
    }

    const cmd = spawn(command, args, {
      shell: process.platform === 'win32',
      stdio: 'inherit',
      ...options,
    });

    cmd.on('close', (code) => {
      if (code !== 0) {
        reject(
          new Error(`"${command} ${args.join(' ')}" failed with code ${code}`),
        );
      } else {
        resolve();
      }
    });
  });
}
