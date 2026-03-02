import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { color } from '@oclif/color';

const exec = promisify(_exec);

interface CheckResult {
  passed: boolean;
  message: string;
  hint?: string;
  critical?: boolean;
}

interface PreflightResults {
  allPassed: boolean;
  criticalFailed: boolean;
  results: Array<{ name: string; result: CheckResult }>;
}

const ICONS = {
  success: color.green('✓'),
  error: color.red('✗'),
  warning: color.yellow('⚠'),
  info: color.cyan('ℹ'),
};

/**
 * Get the project root path
 */
async function getProjectRoot(): Promise<string> {
  // Walk up to find package.json with "saas" bin
  let currentDir = process.cwd();
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const pkgPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        // Check if this is the SaaS Boilerplate root
        if (pkg.name === 'saas-boilerplate' || pkg.scripts?.['saas']) {
          return currentDir;
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
    currentDir = path.dirname(currentDir);
  }

  return process.cwd();
}

/**
 * Check if a command exists and optionally check version
 */
async function checkCommand(
  command: string,
  versionFlag = '--version',
  minVersion?: string
): Promise<{ exists: boolean; version?: string }> {
  try {
    const { stdout } = await exec(`${command} ${versionFlag}`);
    const versionMatch = stdout.match(/\d+\.\d+(\.\d+)?/);
    return { exists: true, version: versionMatch?.[0] };
  } catch {
    return { exists: false };
  }
}

/**
 * Compare version strings (e.g., "20.0.0" >= "18.0.0")
 */
function compareVersions(current: string, minimum: string): boolean {
  const currentParts = current.split('.').map(Number);
  const minimumParts = minimum.split('.').map(Number);

  for (let i = 0; i < Math.max(currentParts.length, minimumParts.length); i++) {
    const curr = currentParts[i] || 0;
    const min = minimumParts[i] || 0;
    if (curr > min) return true;
    if (curr < min) return false;
  }
  return true;
}

/**
 * Check Node.js installation and version
 */
async function checkNodejs(): Promise<CheckResult> {
  const result = await checkCommand('node');
  if (!result.exists) {
    return {
      passed: false,
      message: 'Node.js is not installed',
      hint: 'Install Node.js 20+ from https://nodejs.org or use nvm',
      critical: true,
    };
  }

  if (result.version && !compareVersions(result.version, '20.0')) {
    return {
      passed: false,
      message: `Node.js ${result.version} found, but 20+ is required`,
      hint: 'Upgrade Node.js: nvm install 20 && nvm use 20',
      critical: true,
    };
  }

  return {
    passed: true,
    message: `Node.js ${result.version}`,
  };
}

/**
 * Check pnpm installation and version
 */
async function checkPnpm(): Promise<CheckResult> {
  const result = await checkCommand('pnpm');
  if (!result.exists) {
    return {
      passed: false,
      message: 'pnpm is not installed',
      hint: 'Install pnpm: npm install -g pnpm',
      critical: true,
    };
  }

  if (result.version && !compareVersions(result.version, '9.0')) {
    return {
      passed: false,
      message: `pnpm ${result.version} found, but 9+ is required`,
      hint: 'Upgrade pnpm: npm install -g pnpm@latest',
      critical: true,
    };
  }

  return {
    passed: true,
    message: `pnpm ${result.version}`,
  };
}

/**
 * Check Docker installation and if it's running
 */
async function checkDocker(): Promise<CheckResult> {
  const result = await checkCommand('docker');
  if (!result.exists) {
    return {
      passed: false,
      message: 'Docker is not installed',
      hint: 'Install Docker from https://docs.docker.com/get-docker',
      critical: true,
    };
  }

  // Check if Docker daemon is running
  try {
    await exec('docker info');
  } catch {
    return {
      passed: false,
      message: 'Docker is installed but not running',
      hint: 'Start Docker Desktop or run: sudo systemctl start docker',
      critical: true,
    };
  }

  return {
    passed: true,
    message: `Docker ${result.version}`,
  };
}

/**
 * Check Docker Compose
 */
async function checkDockerCompose(): Promise<CheckResult> {
  // Try docker compose (v2)
  let result = await checkCommand('docker compose', 'version');
  if (result.exists) {
    return {
      passed: true,
      message: `Docker Compose ${result.version || 'available'}`,
    };
  }

  // Try docker-compose (v1)
  result = await checkCommand('docker-compose');
  if (result.exists) {
    return {
      passed: true,
      message: `Docker Compose ${result.version || 'available'} (legacy)`,
    };
  }

  return {
    passed: false,
    message: 'Docker Compose is not available',
    hint: 'Docker Compose is included with Docker Desktop. Update Docker or install compose plugin.',
    critical: true,
  };
}

/**
 * Check WSL on Windows
 */
async function checkWsl(): Promise<CheckResult | null> {
  // Only check on Windows
  if (os.platform() !== 'win32') {
    return null;
  }

  const result = await checkCommand('wsl', '--version');
  if (!result.exists) {
    return {
      passed: false,
      message: 'WSL 2 is required on Windows',
      hint: 'Install WSL 2: wsl --install (requires restart)',
      critical: true,
    };
  }

  return {
    passed: true,
    message: 'WSL 2 available',
  };
}

/**
 * Check if we're in the project root directory (not a subdirectory)
 */
async function checkProjectDirectory(): Promise<CheckResult> {
  const cwd = process.cwd();

  // Check for key files that should exist ONLY in project root
  const requiredFiles = ['package.json', 'docker-compose.yml', 'pnpm-workspace.yaml'];
  const missingFiles = requiredFiles.filter(
    (file) => !fs.existsSync(path.join(cwd, file))
  );

  if (missingFiles.length > 0) {
    // Try to find the project root by walking up
    let searchDir = cwd;
    const root = path.parse(searchDir).root;
    let foundRoot: string | null = null;

    while (searchDir !== root) {
      const hasAllFiles = requiredFiles.every(
        (file) => fs.existsSync(path.join(searchDir, file))
      );
      if (hasAllFiles) {
        foundRoot = searchDir;
        break;
      }
      searchDir = path.dirname(searchDir);
    }

    if (foundRoot) {
      // User is in a subdirectory of the project
      const relativePath = path.relative(cwd, foundRoot);
      return {
        passed: false,
        message: 'You are in a subdirectory, not the project root',
        hint: `Run: cd ${relativePath || '..'}`,
        critical: true,
      };
    }

    return {
      passed: false,
      message: `Not in project root (missing: ${missingFiles.join(', ')})`,
      hint: 'cd into your SaaS Boilerplate project directory',
      critical: true,
    };
  }

  // Verify it's a SaaS Boilerplate project
  try {
    const pkgPath = path.join(cwd, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    // Check for @sb/cli in devDependencies (the CLI package) or name "sb"
    const hasSbCli = pkg.devDependencies?.['@sb/cli'] || pkg.dependencies?.['@sb/cli'];
    const isSbProject = pkg.name === 'sb' || pkg.name === 'saas-boilerplate';

    if (!hasSbCli && !isSbProject) {
      return {
        passed: false,
        message: 'This does not appear to be a SaaS Boilerplate project',
        hint: 'Make sure you cloned the SaaS Boilerplate repository',
        critical: true,
      };
    }
  } catch {
    return {
      passed: false,
      message: 'Could not read package.json',
      critical: true,
    };
  }

  return {
    passed: true,
    message: 'In project root',
  };
}

/**
 * Check if dependencies are installed
 */
async function checkDependencies(): Promise<CheckResult> {
  const cwd = process.cwd();
  const nodeModulesPath = path.join(cwd, 'node_modules');

  if (!fs.existsSync(nodeModulesPath)) {
    return {
      passed: false,
      message: 'Dependencies not installed',
      hint: 'Run: pnpm install',
      critical: true,
    };
  }

  // Check for key packages
  const keyPackages = ['@sb/cli', 'nx', 'typescript'];
  const missingPackages = keyPackages.filter(
    (pkg) => !fs.existsSync(path.join(nodeModulesPath, pkg.replace('/', path.sep)))
  );

  if (missingPackages.length > 0) {
    return {
      passed: false,
      message: 'Dependencies incomplete',
      hint: 'Run: pnpm install',
      critical: true,
    };
  }

  return {
    passed: true,
    message: 'Dependencies installed',
  };
}

/**
 * Check root .env file
 */
async function checkRootEnv(): Promise<CheckResult> {
  const cwd = process.cwd();
  const envPath = path.join(cwd, '.env');
  const envSharedPath = path.join(cwd, '.env.shared');

  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envSharedPath)) {
      return {
        passed: false,
        message: 'Root .env file not found',
        hint: 'Run: cp .env.shared .env',
        critical: true,
      };
    }
    return {
      passed: false,
      message: 'Root .env file not found',
      hint: 'Create a .env file from the template',
      critical: true,
    };
  }

  // Check for required variables
  const envContent = fs.readFileSync(envPath, 'utf-8');
  if (!envContent.includes('PROJECT_NAME=') || envContent.includes('PROJECT_NAME=\n')) {
    return {
      passed: false,
      message: 'PROJECT_NAME not set in .env',
      hint: 'Set PROJECT_NAME in your .env file',
      critical: true,
    };
  }

  return {
    passed: true,
    message: 'Root .env configured',
  };
}

/**
 * Check backend .env file
 */
async function checkBackendEnv(): Promise<CheckResult> {
  const cwd = process.cwd();
  const envPath = path.join(cwd, 'packages', 'backend', '.env');
  const envSharedPath = path.join(cwd, 'packages', 'backend', '.env.shared');

  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envSharedPath)) {
      return {
        passed: false,
        message: 'Backend .env file not found',
        hint: 'Run: cp packages/backend/.env.shared packages/backend/.env',
        critical: true,
      };
    }
    return {
      passed: false,
      message: 'Backend .env file not found',
      critical: true,
    };
  }

  // Check for key variables that should be customized
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const warnings: string[] = [];

  if (envContent.includes('DJANGO_SECRET_KEY=X&*az9nsBNykh')) {
    warnings.push('Using default DJANGO_SECRET_KEY (should generate new one)');
  }

  if (warnings.length > 0) {
    return {
      passed: true,
      message: 'Backend .env configured',
      hint: warnings.join('; '),
    };
  }

  return {
    passed: true,
    message: 'Backend .env configured',
  };
}

/**
 * Check docker-compose.yml exists
 */
async function checkDockerComposeFile(): Promise<CheckResult> {
  const cwd = process.cwd();
  const composePath = path.join(cwd, 'docker-compose.yml');

  if (!fs.existsSync(composePath)) {
    return {
      passed: false,
      message: 'docker-compose.yml not found',
      hint: 'Make sure you cloned the complete repository',
      critical: true,
    };
  }

  return {
    passed: true,
    message: 'docker-compose.yml found',
  };
}

/**
 * Run all preflight checks
 */
export async function runPreflightChecks(): Promise<PreflightResults> {
  const checks: Array<{ name: string; check: () => Promise<CheckResult | null> }> = [
    { name: 'Node.js', check: checkNodejs },
    { name: 'pnpm', check: checkPnpm },
    { name: 'Docker', check: checkDocker },
    { name: 'Docker Compose', check: checkDockerCompose },
    { name: 'WSL (Windows)', check: checkWsl },
    { name: 'Project Directory', check: checkProjectDirectory },
    { name: 'Dependencies', check: checkDependencies },
    { name: 'Root .env', check: checkRootEnv },
    { name: 'Backend .env', check: checkBackendEnv },
    { name: 'Docker Compose File', check: checkDockerComposeFile },
  ];

  const results: Array<{ name: string; result: CheckResult }> = [];
  let allPassed = true;
  let criticalFailed = false;

  for (const { name, check } of checks) {
    const result = await check();
    if (result === null) continue; // Skip (e.g., WSL on non-Windows)

    results.push({ name, result });

    if (!result.passed) {
      allPassed = false;
      if (result.critical) {
        criticalFailed = true;
      }
    }
  }

  return { allPassed, criticalFailed, results };
}

/**
 * Print preflight check results
 */
export function printPreflightResults(results: PreflightResults): void {
  console.log('');
  console.log(color.bold('  Preflight Checks'));
  console.log(color.dim('  ─────────────────────────────────────────'));

  for (const { name, result } of results.results) {
    const icon = result.passed ? ICONS.success : (result.critical ? ICONS.error : ICONS.warning);
    const status = result.passed
      ? color.dim(result.message)
      : color.yellow(result.message);

    console.log(`  ${icon} ${name.padEnd(20)} ${status}`);

    if (!result.passed && result.hint) {
      console.log(`     ${color.dim('→')} ${color.cyan(result.hint)}`);
    }
  }

  console.log(color.dim('  ─────────────────────────────────────────'));

  if (results.allPassed) {
    console.log(`  ${ICONS.success} ${color.green('All checks passed!')}`);
  } else if (results.criticalFailed) {
    console.log(`  ${ICONS.error} ${color.red('Critical checks failed. Please fix the issues above.')}`);
  } else {
    console.log(`  ${ICONS.warning} ${color.yellow('Some checks have warnings.')}`);
  }

  console.log('');
}
