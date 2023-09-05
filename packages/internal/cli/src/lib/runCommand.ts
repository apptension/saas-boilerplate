import { spawn } from 'node:child_process';

export function runCommand(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const cmd = spawn(command, args);

    process.stdin.pipe(cmd.stdin);

    cmd.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    cmd.stderr.on('data', (data) => {
      process.stdout.write(data);
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
