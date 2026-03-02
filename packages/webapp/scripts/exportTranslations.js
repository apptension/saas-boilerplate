#!/usr/bin/env node
/**
 * Export Translations Script
 *
 * This script exports translations from the backend database to JSON files
 * in the translations directory. Each active locale gets its own JSON file.
 *
 * Usage:
 *   node scripts/exportTranslations.js
 *
 * Output:
 *   packages/webapp-libs/webapp-core/src/translations/{locale}.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TRANSLATIONS_DIR = path.join(
  __dirname,
  '../../webapp-libs/webapp-core/src/translations'
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
 * Export translations from the database
 */
async function exportTranslations() {
  console.log('📤 Translation Export Script');
  console.log('='.repeat(50));

  if (!isBackendContainerRunning()) {
    console.error('❌ Backend container is not running.');
    console.error('');
    console.error('Start the backend with: pnpm saas backend up');
    process.exit(1);
  }

  console.log('🔍 Fetching translations from database...');

  try {
    // Use the Django management command with json-dump format
    const output = execSync(
      'docker compose exec -T backend python manage.py export_translations --format=json-dump',
      {
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large translation data
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );

    // Parse the JSON output (skip any warning lines)
    const lines = output.split('\n');
    let jsonLine = '';
    for (const line of lines) {
      if (line.startsWith('{')) {
        jsonLine = line;
        break;
      }
    }

    if (!jsonLine) {
      throw new Error('No JSON output from database export');
    }

    const data = JSON.parse(jsonLine);

    console.log(`📚 Found ${data.locales.length} active locales`);
    console.log('');

    // Ensure translations directory exists
    if (!fs.existsSync(TRANSLATIONS_DIR)) {
      fs.mkdirSync(TRANSLATIONS_DIR, { recursive: true });
    }

    // Get total keys count from first locale
    const sampleLocale = data.locales[0]?.code;
    const totalKeys = sampleLocale ? Object.keys(data.translations[sampleLocale] || {}).length : 0;

    // Export each locale
    for (const locale of data.locales) {
      const localeCode = locale.code;
      const translations = data.translations[localeCode] || {};
      const translationCount = Object.keys(translations).length;

      // Build output with defaultMessage wrapper
      const outputData = {};
      for (const [key, value] of Object.entries(translations)) {
        outputData[key] = { defaultMessage: value };
      }

      const outputPath = path.join(TRANSLATIONS_DIR, `${localeCode}.json`);
      fs.writeFileSync(
        outputPath,
        JSON.stringify(outputData, null, 2),
        'utf8'
      );

      const percent = totalKeys > 0 ? ((translationCount / totalKeys) * 100).toFixed(1) : 0;
      const rtlMarker = locale.rtl ? ' (RTL)' : '';

      console.log(`  ✅ ${localeCode}.json - ${translationCount}/${totalKeys} keys (${percent}%)${rtlMarker}`);
    }

    // Also create a locales.json file with metadata
    const localesPath = path.join(TRANSLATIONS_DIR, 'locales.json');
    fs.writeFileSync(
      localesPath,
      JSON.stringify(data.locales, null, 2),
      'utf8'
    );
    console.log(`  ✅ locales.json - ${data.locales.length} locales`);

    // Create translations_export.json for backend deployment
    // This file is used by the backend to import translations during deployment
    const exportData = {
      locales: data.locales,
      translations: data.translations,
    };
    const exportPath = path.join(TRANSLATIONS_DIR, 'translations_export.json');
    fs.writeFileSync(
      exportPath,
      JSON.stringify(exportData, null, 2),
      'utf8'
    );
    console.log(`  ✅ translations_export.json - deployment bundle`);

    console.log('');
    console.log('✅ Export complete!');
    console.log(`   Output directory: ${TRANSLATIONS_DIR}`);

  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

// Run the export
exportTranslations().catch(console.error);
