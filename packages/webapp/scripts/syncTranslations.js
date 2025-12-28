#!/usr/bin/env node
/**
 * Sync Translations Script
 *
 * This script reads the extracted master translations JSON and syncs it
 * to the backend database via API.
 *
 * Usage:
 *   node scripts/syncTranslations.js
 *
 * Environment variables:
 *   TRANSLATIONS_SYNC_API_URL - API endpoint for syncing (default: http://localhost:5001/api/translations/sync/)
 *   TRANSLATIONS_API_TOKEN - Authorization token for the API
 *
 * Prerequisites:
 *   Run `pnpm extract-intl` first to generate the master translations file.
 */

const fs = require('fs');
const path = require('path');

const MASTER_TRANSLATIONS_PATH = path.join(
  __dirname,
  '../../webapp-libs/webapp-core/src/translations/master.json'
);

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

  // Get API configuration
  const apiUrl = process.env.TRANSLATIONS_SYNC_API_URL || 'http://localhost:5001/api/translations/sync/';
  const apiToken = process.env.TRANSLATIONS_API_TOKEN;

  if (!apiToken) {
    console.warn('⚠️  TRANSLATIONS_API_TOKEN not set. Using session authentication.');
    console.warn('   For CI/CD, set this environment variable.');
  }

  console.log(`🌐 Syncing to: ${apiUrl}`);

  // Prepare request
  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiToken) {
    headers['Authorization'] = `Bearer ${apiToken}`;
  }

  try {
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

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('  1. Ensure the backend is running');
    console.error('  2. Check TRANSLATIONS_SYNC_API_URL is correct');
    console.error('  3. Ensure you have admin access or a valid API token');
    process.exit(1);
  }
}

// Run the sync
syncTranslations().catch(console.error);

