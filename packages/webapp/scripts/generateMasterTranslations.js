#!/usr/bin/env node
/**
 * Generate Master Translations Script
 *
 * This script runs formatjs extract and then transforms the output
 * into a format suitable for syncing with the backend.
 *
 * The master.json file contains all translation keys with their
 * default messages and descriptions.
 *
 * Usage:
 *   node scripts/generateMasterTranslations.js
 *
 * Output:
 *   packages/webapp-libs/webapp-core/src/translations/master.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(
  __dirname,
  '../../webapp-libs/webapp-core/src/translations/master.json'
);

const EN_TRANSLATIONS_PATH = path.join(
  __dirname,
  '../../webapp-libs/webapp-core/src/translations/en.json'
);

function generateMasterTranslations() {
  console.log('🔍 Extracting translations from source files...');
  console.log('');

  try {
    // Run formatjs extract with extended format to get descriptions
    // Using explicit file patterns to ensure all webapp-libs are included
    // Glob patterns must NOT have extra quotes when shell expansion is used
    const sourcePatterns = [
      'src/**/*.tsx',
      '../webapp-libs/webapp-ai-assistant/src/**/*.tsx',
      '../webapp-libs/webapp-core/src/**/*.tsx',
      '../webapp-libs/webapp-api-client/src/**/*.tsx',
      '../webapp-libs/webapp-contentful/src/**/*.tsx',
      '../webapp-libs/webapp-crud-demo/src/**/*.tsx',
      '../webapp-libs/webapp-documents/src/**/*.tsx',
      '../webapp-libs/webapp-emails/src/**/*.tsx',
      '../webapp-libs/webapp-finances/src/**/*.tsx',
      '../webapp-libs/webapp-generative-ai/src/**/*.tsx',
      '../webapp-libs/webapp-notifications/src/**/*.tsx',
      '../webapp-libs/webapp-sso/src/**/*.tsx',
      '../webapp-libs/webapp-tenants/src/**/*.tsx',
    ];

    const command = [
      'npx formatjs extract',
      ...sourcePatterns.map(p => `'${p}'`),
      "--id-interpolation-pattern '[sha512:contenthash:base64:6]'",
      `--out-file '${OUTPUT_PATH}'`,
      "--ignore '**/*.spec.tsx'",
      "--ignore '**/tests/mocks/**'",
    ].join(' ');

    execSync(command, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: '/bin/bash',  // Ensure proper shell with glob expansion
    });

    // Check if the file was created
    if (!fs.existsSync(OUTPUT_PATH)) {
      throw new Error('Master translations file was not created');
    }

    // Read and count keys
    const content = fs.readFileSync(OUTPUT_PATH, 'utf8');
    const translations = JSON.parse(content);
    const keyCount = Object.keys(translations).length;

    console.log('');
    console.log('✅ Master translations generated successfully!');
    console.log(`   Output: ${OUTPUT_PATH}`);
    console.log(`   Keys:   ${keyCount}`);
    console.log('');

    // Also update en.json with the same content for bundled fallback
    fs.writeFileSync(EN_TRANSLATIONS_PATH, content, 'utf8');
    console.log(`   Also updated: ${EN_TRANSLATIONS_PATH}`);
    console.log('');

    return true;

  } catch (error) {
    console.error('❌ Failed to generate master translations:', error.message);
    process.exit(1);
  }
}

generateMasterTranslations();

