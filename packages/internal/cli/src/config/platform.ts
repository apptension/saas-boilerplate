import * as storage from 'node-persist';
import { resolve } from 'path';
import { getRootPath } from './env';

export type PlatformType = 'aws' | 'render' | 'vps';

export interface RenderConfig {
  apiKey: string;
  ownerId?: string;
}

export interface DockerRegistryConfig {
  type: 'dockerhub' | 'ghcr' | 'custom';
  username: string;
  // Password/token stored separately for security
  registry?: string; // For custom registries
  namespace?: string; // Organization/username for image naming
}

export interface VPSConfig {
  host: string;
  user: string;
  privateKeyPath?: string;
  port?: number;
  deployPath?: string;
}

export interface PlatformConfig {
  defaultPlatform?: PlatformType;
  render?: RenderConfig;
  vps?: VPSConfig;
  dockerRegistry?: DockerRegistryConfig;
}

const PLATFORM_STORAGE_KEY = 'platform_config';

let storageInitialized = false;

async function initStorage(): Promise<void> {
  if (storageInitialized) return;

  const rootPath = getRootPath();
  const storagePath = resolve(rootPath, '.saas-cli');

  await storage.init({
    dir: storagePath,
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
  });

  storageInitialized = true;
}

export async function getPlatformConfig(): Promise<PlatformConfig> {
  await initStorage();
  return (await storage.getItem(PLATFORM_STORAGE_KEY)) || {};
}

export async function savePlatformConfig(config: PlatformConfig): Promise<void> {
  await initStorage();
  await storage.setItem(PLATFORM_STORAGE_KEY, config);
}

export async function updatePlatformConfig(
  updates: Partial<PlatformConfig>
): Promise<PlatformConfig> {
  const current = await getPlatformConfig();
  const updated = { ...current, ...updates };
  await savePlatformConfig(updated);
  return updated;
}

export function getPlatformDisplayName(platform: PlatformType): string {
  const names: Record<PlatformType, string> = {
    aws: 'AWS (CDK)',
    render: 'Render.com',
    vps: 'VPS / Docker Compose',
  };
  return names[platform] || platform;
}

export function getPlatformDescription(platform: PlatformType): string {
  const descriptions: Record<PlatformType, string> = {
    aws: 'Deploy to AWS using CDK (existing infrastructure)',
    render: 'Deploy to Render.com via their API',
    vps: 'Deploy to any VPS using Docker Compose over SSH',
  };
  return descriptions[platform] || '';
}

export const AVAILABLE_PLATFORMS: PlatformType[] = ['aws', 'render', 'vps'];
