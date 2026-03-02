import { Command, Flags } from '@oclif/core';
import * as util from 'node:util';
import { exec as _exec } from 'node:child_process';

import { initConfig } from '../config/init';
import { runCommand, CommandError } from '../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../lib/docker';
import { BaseCommand } from '../baseCommand';
import {
  StepRenderer,
  colors,
  renderErrorOutput,
  renderTip,
  renderKeyboardHints,
  showCursor,
} from '../lib/ui/renderer';
import { printBannerAnimated } from '../lib/ui/banner';
import { HealthDashboard, getContainerStatuses } from '../lib/ui/healthDashboard';
import { createKeyboardHandler, KeyboardHandler } from '../lib/ui/keyboard';
import { runPreflightChecks, printPreflightResults } from '../lib/preflight';

const exec = util.promisify(_exec);

type Publisher = {
  URL: string;
  PublishedPort: number;
};

type DockerComposePsResult = Array<{
  Project: string;
  Service: string;
  Publishers: Array<Publisher> | null;
}>;

async function getBackendEndpoint(context: Command): Promise<string> {
  const expectedBackendPort = 5001;
  const { stdout: psResultStr } = await exec('docker compose ps --format=json');
  let psResult: DockerComposePsResult;
  try {
    psResult = JSON.parse(psResultStr) as DockerComposePsResult;
  } catch {
    // new docker returns JSONL instead of JSON so need to filter empty lines and parse every line separately
    psResult = psResultStr
      .split(/\r?\n/)
      .filter((line) => line.trim() !== '')
      .map((v) => JSON.parse(v)) as DockerComposePsResult;
  }

  const backendContainerExists = psResult.some(
    ({ Service: service }) => service === 'backend',
  );

  if (!backendContainerExists) {
    context.error('running backend container not found');
  }

  const hasExpectedPort = ({ PublishedPort }: Publisher) =>
    PublishedPort === expectedBackendPort;
  const backendContainer = psResult.find(
    ({ Service: service, Publishers: publishers }) =>
      service === 'backend' && publishers?.some(hasExpectedPort),
  );

  if (!backendContainer) {
    context.error(
      `backend container does not expose expected port ${expectedBackendPort}. Web app will not be able to send requests
to API. Make sure that backend service in docker-compose.yml exposes ${expectedBackendPort}. Read more on
docker compose networking in official documentation: https://docs.docker.com/compose/networking/`,
    );
  }

  const publisher = backendContainer.Publishers?.find(hasExpectedPort);
  return `http://${publisher?.URL}:${publisher?.PublishedPort}`;
}

interface WaitForBackendResult {
  success: boolean;
  attempts: number;
}

async function waitForBackendWithHealth(
  url: string,
  options: {
    retryCount: number;
    stepTime?: number;
    healthDashboard: HealthDashboard;
    onProgress?: (attempt: number, total: number) => void;
  },
): Promise<WaitForBackendResult> {
  const { retryCount, stepTime = 1000, healthDashboard, onProgress } = options;

  for (let i = 0; i < retryCount; i++) {
    if (onProgress) {
      onProgress(i + 1, retryCount);
    }

    try {
      await fetch(url, { method: 'GET' });
      return { success: true, attempts: i + 1 };
    } catch {
      await new Promise((resolve) => setTimeout(resolve, stepTime));
    }
  }

  return { success: false, attempts: retryCount };
}

export default class Up extends BaseCommand<typeof Up> {
  static description = 'Starts both backend and frontend';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  static flags = {
    verbose: Flags.boolean({
      char: 'v',
      description: 'Show verbose output',
      default: false,
    }),
    'skip-checks': Flags.boolean({
      description: 'Skip preflight checks',
      default: false,
    }),
  };

  private renderer: StepRenderer | null = null;
  private healthDashboard: HealthDashboard | null = null;
  private keyboardHandler: KeyboardHandler | null = null;
  private verbose = false;
  private showLogs = false;

  async run(): Promise<void> {
    const { flags } = await this.parse(Up);
    this.verbose = flags.verbose;

    // Show animated banner first
    await printBannerAnimated({ speed: 20 });

    // Run preflight checks (unless skipped)
    if (!flags['skip-checks']) {
      const preflightResults = await runPreflightChecks();
      printPreflightResults(preflightResults);

      if (preflightResults.criticalFailed) {
        this.error('Please fix the issues above before running `pnpm saas up`');
      }
    }

    // Initialize config (this also validates some environment things)
    await initConfig(this, { requireLocalEnvStage: true });
    await assertDockerIsRunning();
    await dockerHubLogin();

    // Create UI components
    this.renderer = new StepRenderer(5);
    this.healthDashboard = new HealthDashboard();

    // Setup keyboard handler
    this.setupKeyboardHandler();

    // Setup cleanup on exit
    const cleanup = async () => {
      this.renderer?.cleanup();
      this.healthDashboard?.stopPolling();
      this.keyboardHandler?.disable();
      showCursor();
    };

    process.on('SIGINT', async () => {
      await cleanup();
      console.log('\n\nInterrupted. Running cleanup...');
      try {
        await runCommand('pnpm', ['nx', 'run', 'core:docker-compose:down'], { silent: true, outputMode: 'capture' });
      } catch {
        // Ignore cleanup errors
      }
      process.exit(130);
    });

    try {
      // Start rendering steps
      this.renderer.startWithoutTitle();

      // Step 1: Build emails
      this.renderer.startStep('Building email templates');
      await this.runStepCommand('pnpm', ['saas', 'emails', 'build']);
      this.renderer.completeStep();

      // Step 2: Setup Docker volumes
      this.renderer.startStep('Creating Docker volumes');
      await this.runStepCommand('pnpm', ['nx', 'run', 'core:setup']);
      this.renderer.completeStep();

      // Step 3: Build Docker images
      this.renderer.startStep('Building Docker images');
      await this.runStepCommand('pnpm', ['nx', 'run-many', '--target=compose-build-image', '--projects=backend,workers']);
      this.renderer.completeStep();

      // Step 4: Start services
      this.renderer.startStep('Starting Docker services');
      await this.runStepCommand('docker', ['compose', 'up', '--force-recreate', '-d', 'backend', 'workers', 'celery_default', 'celery_beat', 'mcp-server']);
      this.renderer.completeStep();

      // Step 5: Wait for backend
      this.renderer.startStep('Waiting for backend');

      // Enable keyboard input
      this.keyboardHandler?.enable();

      const backendEndpoint = await getBackendEndpoint(this);
      const result = await waitForBackendWithHealth(backendEndpoint, {
        retryCount: 200,
        stepTime: 1000,
        healthDashboard: this.healthDashboard,
      });

      // Disable keyboard
      this.keyboardHandler?.disable();

      if (!result.success) {
        this.renderer.failStep(
          new Error('Backend failed to start'),
          'Timeout waiting for backend to become ready.\n\nTry running: docker compose logs backend -f',
        );
        this.error(
          'Timeout: Backend dev server failed to start. Run `docker compose logs backend -f` to understand why.',
        );
      }

      this.renderer.completeStep();

      // Show final summary
      this.renderer.finish([
        `${colors.dim('Frontend:')}  ${colors.url('http://localhost:3000')}`,
        `${colors.dim('Backend:')}   ${colors.url('http://localhost:5001')}`,
        `${colors.dim('GraphQL:')}   ${colors.url('http://localhost:5001/graphql')}`,
      ]);

      // Cleanup UI state
      await cleanup();

      // Start webapp (this runs in foreground, showing its output)
      console.log('');
      console.log(colors.dim('Starting webapp dev server...\n'));
      await runCommand('pnpm', ['nx', 'run', 'webapp:start']);

    } catch (error) {
      await cleanup();

      if (error instanceof CommandError) {
        this.renderer?.failStep(error, error.output);
        console.log(renderTip('Fix the error and run `pnpm saas up` again'));
      }

      throw error;
    }
  }

  private setupKeyboardHandler(): void {
    this.keyboardHandler = createKeyboardHandler({
      onVerboseToggle: () => {
        this.verbose = !this.verbose;
        // Could update UI to show verbose state
      },
      onLogsToggle: () => {
        this.showLogs = !this.showLogs;
        if (this.healthDashboard) {
          this.healthDashboard.toggleLogs();
        }
      },
      onQuit: async () => {
        this.renderer?.cleanup();
        this.healthDashboard?.stopPolling();
        console.log('\n\nStopping services...');
        try {
          await runCommand('pnpm', ['nx', 'run', 'core:docker-compose:down'], { silent: true, outputMode: 'capture' });
        } catch {
          // Ignore
        }
      },
    });
  }

  private async runStepCommand(command: string, args: string[]): Promise<void> {
    const outputMode = this.verbose ? 'inherit' : 'buffer';
    await runCommand(command, args, { silent: true, outputMode });
  }
}
