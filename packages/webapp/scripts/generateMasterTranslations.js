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
    // Using the --format option to get full message descriptors
    execSync(
      `npx formatjs extract ` +
      `'src/**/!(*.d).(js|jsx|ts|tsx)' ` +
      `'../webapp-libs/*/src/**/!(*.d).(js|jsx|ts|tsx)' ` +
      `--id-interpolation-pattern '[sha512:contenthash:base64:6]' ` +
      `--out-file ${OUTPUT_PATH} ` +
      `--ignore 'src/tests/mocks/**' ` +
      `--ignore '../webapp-libs/*/src/tests/mocks/**'`,
      {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
      }
    );

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

