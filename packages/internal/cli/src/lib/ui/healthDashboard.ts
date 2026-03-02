import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { color } from '@oclif/color';
import { ICONS, colors } from './renderer';

const execAsync = promisify(exec);

export type ContainerStatus = {
  name: string;
  service: string;
  status: 'running' | 'starting' | 'unhealthy' | 'stopped' | 'unknown';
  health?: string;
  ports?: string;
};

export type ServiceConfig = {
  name: string;
  displayName: string;
  essential?: boolean; // If true, startup waits for this service
};

// Default services to monitor
export const DEFAULT_SERVICES: ServiceConfig[] = [
  { name: 'db', displayName: 'PostgreSQL', essential: false },
  { name: 'redis', displayName: 'Redis', essential: false },
  { name: 'backend', displayName: 'Backend API', essential: true },
  { name: 'celery_default', displayName: 'Celery Worker', essential: false },
  { name: 'celery_beat', displayName: 'Celery Beat', essential: false },
  { name: 'workers', displayName: 'Workers', essential: false },
  { name: 'mcp-server', displayName: 'MCP Server', essential: false },
];

/**
 * Parse docker compose ps output to get container statuses
 */
export async function getContainerStatuses(
  services?: ServiceConfig[],
): Promise<ContainerStatus[]> {
  const serviceList = services ?? DEFAULT_SERVICES;

  try {
    const { stdout } = await execAsync('docker compose ps --format json');

    // Parse JSON or JSONL output
    let containers: Array<{
      Name: string;
      Service: string;
      State: string;
      Health?: string;
      Status?: string;
      Publishers?: Array<{ PublishedPort: number }>;
    }> = [];

    try {
      containers = JSON.parse(stdout);
    } catch {
      // Handle JSONL format (newer Docker versions)
      containers = stdout
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line));
    }

    // Map to our status format
    return serviceList.map((svc) => {
      const container = containers.find((c) => c.Service === svc.name);

      if (!container) {
        return {
          name: svc.displayName,
          service: svc.name,
          status: 'stopped' as const,
        };
      }

      let status: ContainerStatus['status'] = 'unknown';
      const state = container.State?.toLowerCase() ?? '';
      const health = container.Health?.toLowerCase() ?? '';

      if (state === 'running') {
        if (health === 'healthy') {
          status = 'running';
        } else if (health === 'unhealthy') {
          status = 'unhealthy';
        } else if (health === 'starting' || state.includes('starting')) {
          status = 'starting';
        } else {
          status = 'running';
        }
      } else if (state === 'created' || state === 'restarting') {
        status = 'starting';
      } else {
        status = 'stopped';
      }

      const ports = container.Publishers
        ?.filter((p) => p.PublishedPort)
        .map((p) => p.PublishedPort.toString())
        .join(', ');

      return {
        name: svc.displayName,
        service: svc.name,
        status,
        health: container.Health,
        ports,
      };
    });
  } catch (error) {
    // Return all services as unknown if docker command fails
    return serviceList.map((svc) => ({
      name: svc.displayName,
      service: svc.name,
      status: 'unknown' as const,
    }));
  }
}

/**
 * Get status icon for a container
 */
function getStatusIcon(status: ContainerStatus['status']): string {
  switch (status) {
    case 'running':
      return color.green('●');
    case 'starting':
      return color.yellow('○');
    case 'unhealthy':
      return color.red('●');
    case 'stopped':
      return color.dim('○');
    default:
      return color.dim('?');
  }
}

/**
 * Get status text for a container
 */
function getStatusText(status: ContainerStatus['status']): string {
  switch (status) {
    case 'running':
      return color.green('healthy');
    case 'starting':
      return color.yellow('starting');
    case 'unhealthy':
      return color.red('unhealthy');
    case 'stopped':
      return color.dim('stopped');
    default:
      return color.dim('unknown');
  }
}

/**
 * Render service status lines for display
 */
export function renderServiceStatus(statuses: ContainerStatus[]): string[] {
  const lines: string[] = [];
  lines.push(colors.dim('Services:'));

  statuses.forEach((svc, index) => {
    const isLast = index === statuses.length - 1;
    const prefix = isLast ? '└─' : '├─';
    const icon = getStatusIcon(svc.status);
    const statusText = getStatusText(svc.status);
    const portsInfo = svc.ports ? color.dim(` :${svc.ports}`) : '';

    lines.push(`${prefix} ${svc.name.padEnd(16)} ${icon} ${statusText}${portsInfo}`);
  });

  return lines;
}

/**
 * Health dashboard for monitoring Docker containers
 */
export class HealthDashboard {
  private services: ServiceConfig[];
  private pollInterval: NodeJS.Timeout | null = null;
  private logProcess: ChildProcess | null = null;
  private showLogs = false;
  private lastStatuses: ContainerStatus[] = [];
  private onUpdate: ((lines: string[]) => void) | null = null;

  constructor(services?: ServiceConfig[]) {
    this.services = services ?? DEFAULT_SERVICES;
  }

  /**
   * Start polling container statuses
   */
  startPolling(intervalMs = 2000, onUpdate?: (lines: string[]) => void): void {
    this.onUpdate = onUpdate ?? null;

    // Initial poll
    this.poll();

    this.pollInterval = setInterval(() => {
      this.poll();
    }, intervalMs);
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.stopLogTail();
  }

  /**
   * Get current service statuses
   */
  getStatuses(): ContainerStatus[] {
    return this.lastStatuses;
  }

  /**
   * Toggle Docker log tailing
   */
  toggleLogs(): void {
    this.showLogs = !this.showLogs;
    if (this.showLogs) {
      this.startLogTail('backend');
    } else {
      this.stopLogTail();
    }
  }

  /**
   * Check if essential services are ready
   */
  areEssentialServicesReady(): boolean {
    const essentialServices = this.services.filter((s) => s.essential);
    return essentialServices.every((svc) => {
      const status = this.lastStatuses.find((s) => s.service === svc.name);
      return status?.status === 'running';
    });
  }

  /**
   * Start tailing logs from a container
   */
  startLogTail(container: string): void {
    this.stopLogTail();

    this.logProcess = spawn('docker', ['compose', 'logs', '-f', '--tail=10', container], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    this.logProcess.stdout?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(Boolean);
      lines.forEach((line) => {
        console.log(colors.dim(`  │ ${line}`));
      });
    });

    this.logProcess.stderr?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(Boolean);
      lines.forEach((line) => {
        console.log(colors.dim(`  │ ${line}`));
      });
    });
  }

  /**
   * Stop tailing logs
   */
  stopLogTail(): void {
    if (this.logProcess) {
      this.logProcess.kill();
      this.logProcess = null;
    }
  }

  /**
   * Render current status as strings
   */
  render(): string[] {
    return renderServiceStatus(this.lastStatuses);
  }

  private async poll(): Promise<void> {
    this.lastStatuses = await getContainerStatuses(this.services);
    if (this.onUpdate) {
      this.onUpdate(this.render());
    }
  }
}

/**
 * Wait for a specific service to be healthy
 */
export async function waitForService(
  serviceName: string,
  options: {
    timeout?: number;
    pollInterval?: number;
    onProgress?: (elapsed: number, status: ContainerStatus | undefined) => void;
  } = {},
): Promise<boolean> {
  const timeout = options.timeout ?? 120000; // 2 minutes default
  const pollInterval = options.pollInterval ?? 2000;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const statuses = await getContainerStatuses();
    const status = statuses.find((s) => s.service === serviceName);

    if (options.onProgress) {
      options.onProgress(Date.now() - startTime, status);
    }

    if (status?.status === 'running') {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  return false;
}
