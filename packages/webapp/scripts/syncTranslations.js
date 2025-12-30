#!/usr/bin/env node
/**
 * Sync Translations Script
 *
 * This script reads the extracted master translations JSON and syncs it
 * to the backend database using docker exec and the Django management command.
 *
 * Usage:
 *   node scripts/syncTranslations.js
 *
 * Environment variables:
 *   TRANSLATIONS_SYNC_MODE - 'docker' (default) or 'api'
 *   TRANSLATIONS_SYNC_API_URL - API endpoint for syncing (only for api mode)
 *   TRANSLATIONS_API_TOKEN - Authorization token for the API (only for api mode)
 *
 * Prerequisites:
 *   Run `pnpm extract-intl` first to generate the master translations file.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const MASTER_TRANSLATIONS_PATH = path.join(
  __dirname,
  '../../webapp-libs/webapp-core/src/translations/master.json'
);

/**
 * Check if docker compose backend container is running
 */
function isBackendContainerRunning() {
  try {
    const result = execSync('docker compose ps --format json backend', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    // Parse JSONL format (each line is a JSON object)
    const lines = result.trim().split('\n').filter(Boolean);
    return lines.some((line) => {
      try {
        const container = JSON.parse(line);
        return container.State === 'running';
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

/**
 * Sync using docker exec and Django management command
 */
async function syncWithDocker(masterPath) {
  console.log('🐳 Using docker exec to sync translations...');

  if (!isBackendContainerRunning()) {
    console.error('❌ Backend container is not running.');
    console.error('');
    console.error('Start the backend with: pnpm saas backend up');
    process.exit(1);
  }

  // The translations directory is mounted in docker-compose.local.yml
  // at ./packages/webapp-libs/webapp-core/src/translations/:/app/translations:ro
  // So we can use the mounted path directly
  const containerMasterPath = '/app/translations/master.json';

  // Run the management command using the mounted volume
  return new Promise((resolve, reject) => {
    const proc = spawn(
      'docker',
      ['compose', 'exec', '-T', 'backend', 'python', 'manage.py', 'sync_translations', containerMasterPath],
      { stdio: 'inherit' }
    );

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`sync_translations exited with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Sync using HTTP API (legacy method, requires authentication)
 */
async function syncWithApi(masterData) {
  const apiUrl = process.env.TRANSLATIONS_SYNC_API_URL || 'http://localhost:5001/api/translations/sync/';
  const apiToken = process.env.TRANSLATIONS_API_TOKEN;

  if (!apiToken) {
    console.warn('⚠️  TRANSLATIONS_API_TOKEN not set. Using session authentication.');
    console.warn('   For CI/CD without admin access, use TRANSLATIONS_SYNC_MODE=docker instead.');
  }

  console.log(`🌐 Syncing to: ${apiUrl}`);

  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiToken) {
    headers['Authorization'] = `Bearer ${apiToken}`;
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ translations: masterData }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const result = await response.json();

  console.log('');
  console.log('✅ Sync Complete!');
  console.log('='.repeat(50));
  console.log(`   Created:    ${result.stats?.created || 0} keys`);
  console.log(`   Updated:    ${result.stats?.updated || 0} keys`);
  console.log(`   Deprecated: ${result.stats?.deprecated || 0} keys`);
  console.log(`   Unchanged:  ${result.stats?.unchanged || 0} keys`);
  console.log('');

  if (result.stats?.deprecated > 0) {
    console.log('ℹ️  Some keys were marked as deprecated. These are no longer in the codebase');
    console.log('   but their translations are preserved for historical reference.');
  }
}

async function syncTranslations() {
  console.log('📚 Translation Sync Script');
  console.log('='.repeat(50));

  // Check if master file exists
  if (!fs.existsSync(MASTER_TRANSLATIONS_PATH)) {
    console.error('❌ Master translations file not found at:', MASTER_TRANSLATIONS_PATH);
    console.error('');
    console.error('Please run "pnpm extract-intl" first to generate the master file.');
    process.exit(1);
  }

  // Read master translations
  let masterData;
  try {
    const content = fs.readFileSync(MASTER_TRANSLATIONS_PATH, 'utf8');
    masterData = JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to read master translations:', error.message);
    process.exit(1);
  }

  const keyCount = Object.keys(masterData).length;
  console.log(`📖 Found ${keyCount} translation keys in master file`);

  // Determine sync mode
  const syncMode = process.env.TRANSLATIONS_SYNC_MODE || 'docker';

  try {
    if (syncMode === 'api') {
      await syncWithApi(masterData);
    } else {
      await syncWithDocker(MASTER_TRANSLATIONS_PATH);
    }
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    if (syncMode === 'docker') {
      console.error('  1. Ensure the backend container is running: pnpm saas backend up');
      console.error('  2. Check docker compose logs: docker compose logs backend');
    } else {
      console.error('  1. Ensure the backend is running');
      console.error('  2. Set TRANSLATIONS_API_TOKEN for authentication');
      console.error('  3. Or use TRANSLATIONS_SYNC_MODE=docker (recommended)');
    }
    process.exit(1);
  }
}

// Run the sync
syncTranslations().catch(console.error);

