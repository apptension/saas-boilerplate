import { SpawnOptionsWithoutStdio, spawn } from 'node:child_process';

export type OutputMode = 'inherit' | 'buffer' | 'capture';

export type RunCommandOptions = SpawnOptionsWithoutStdio & {
  /**
   * Don't print the command being executed
   */
  silent?: boolean;
  /**
   * Output handling mode:
   * - 'inherit': Pass through to terminal (default, current behavior)
   * - 'buffer': Capture output, only show on error
   * - 'capture': Capture output and return it, never print
   */
  outputMode?: OutputMode;
  /**
   * Callback for streaming output (only used with 'buffer' or 'capture' modes)
   */
  onOutput?: (data: string, stream: 'stdout' | 'stderr') => void;
};

export type RunCommandResult = {
  code: number;
  stdout: string;
  stderr: string;
  output: string; // Combined stdout + stderr in order
};

/**
 * Run a command with flexible output handling
 */
export function runCommand(
  command: string,
  args: string[],
  options?: RunCommandOptions,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const outputMode = options?.outputMode ?? 'inherit';

    if (!options?.silent && outputMode === 'inherit') {
      console.log([command, ...args].join(' '));
    }

    const stdio = outputMode === 'inherit' ? 'inherit' : 'pipe';

    const cmd = spawn(command, args, {
      shell: process.platform === 'win32',
      stdio,
      ...options,
    });

    const outputBuffer: string[] = [];

    if (outputMode !== 'inherit' && cmd.stdout && cmd.stderr) {
      cmd.stdout.on('data', (data: Buffer) => {
        const str = data.toString();
        outputBuffer.push(str);
        if (options?.onOutput) {
          options.onOutput(str, 'stdout');
        }
      });

      cmd.stderr.on('data', (data: Buffer) => {
        const str = data.toString();
        outputBuffer.push(str);
        if (options?.onOutput) {
          options.onOutput(str, 'stderr');
        }
      });
    }

    cmd.on('close', (code) => {
      if (code !== 0) {
        const error = new CommandError(
          `"${command} ${args.join(' ')}" failed with code ${code}`,
          code ?? 1,
          outputBuffer.join(''),
        );

        // In buffer mode, print output on error
        if (outputMode === 'buffer' && outputBuffer.length > 0) {
          console.log(outputBuffer.join(''));
        }

        reject(error);
      } else {
        resolve();
      }
    });

    cmd.on('error', (err) => {
      reject(
        new CommandError(
          `Failed to execute "${command} ${args.join(' ')}": ${err.message}`,
          1,
          outputBuffer.join(''),
        ),
      );
    });
  });
}

/**
 * Run a command and return the full result including captured output
 */
export function runCommandWithOutput(
  command: string,
  args: string[],
  options?: Omit<RunCommandOptions, 'outputMode'>,
): Promise<RunCommandResult> {
  return new Promise<RunCommandResult>((resolve, reject) => {
    if (!options?.silent) {
      // Don't print command in capture mode
    }

    const cmd = spawn(command, args, {
      shell: process.platform === 'win32',
      stdio: 'pipe',
      ...options,
    });

    const stdout: string[] = [];
    const stderr: string[] = [];
    const output: string[] = [];

    if (cmd.stdout) {
      cmd.stdout.on('data', (data: Buffer) => {
        const str = data.toString();
        stdout.push(str);
        output.push(str);
        if (options?.onOutput) {
          options.onOutput(str, 'stdout');
        }
      });
    }

    if (cmd.stderr) {
      cmd.stderr.on('data', (data: Buffer) => {
        const str = data.toString();
        stderr.push(str);
        output.push(str);
        if (options?.onOutput) {
          options.onOutput(str, 'stderr');
        }
      });
    }

    cmd.on('close', (code) => {
      resolve({
        code: code ?? 0,
        stdout: stdout.join(''),
        stderr: stderr.join(''),
        output: output.join(''),
      });
    });

    cmd.on('error', (err) => {
      reject(new Error(`Failed to execute "${command} ${args.join(' ')}": ${err.message}`));
    });
  });
}

/**
 * Custom error class that includes captured output
 */
export class CommandError extends Error {
  constructor(
    message: string,
    public code: number,
    public output: string,
  ) {
    super(message);
    this.name = 'CommandError';
  }
}
