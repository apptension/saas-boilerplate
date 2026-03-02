const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Post-generation action utilities for PLOP generators
 * Provides automation for formatting, codegen, server restarts, and IDE integration
 */

const ROOT_DIR = path.resolve(__dirname, '..', '..', '..', '..');
const WEBAPP_DIR = path.resolve(__dirname, '..', '..');

/**
 * Format files with Prettier
 * @param {string[]} filePaths - Array of file paths to format
 * @returns {Promise<boolean>} Success status
 */
async function formatFiles(filePaths) {
  if (!filePaths || filePaths.length === 0) return true;

  try {
    const files = filePaths.join(' ');
    execSync(`pnpm prettier --write ${files}`, {
      cwd: ROOT_DIR,
      stdio: 'pipe',
    });
    console.log(`  ✓ Formatted ${filePaths.length} file(s) with Prettier`);
    return true;
  } catch (error) {
    console.log(`  ⚠ Could not format files: ${error.message}`);
    return false;
  }
}

/**
 * Run GraphQL codegen to generate TypeScript types
 * @returns {Promise<boolean>} Success status
 */
async function runGraphQLCodegen() {
  try {
    console.log('  ⏳ Running GraphQL codegen...');
    execSync('pnpm nx run webapp-api-client:graphql-codegen', {
      cwd: ROOT_DIR,
      stdio: 'pipe',
    });
    console.log('  ✓ GraphQL types generated successfully');
    return true;
  } catch (error) {
    console.log(`  ⚠ GraphQL codegen failed: ${error.message}`);
    console.log('    Run manually: pnpm nx run webapp-api-client:graphql-codegen');
    return false;
  }
}

/**
 * Download GraphQL schema from backend
 * Requires backend to be running
 * @returns {Promise<boolean>} Success status
 */
async function downloadSchema() {
  try {
    console.log('  ⏳ Downloading GraphQL schema...');
    execSync('pnpm saas webapp graphql download-schema', {
      cwd: ROOT_DIR,
      stdio: 'pipe',
    });
    console.log('  ✓ GraphQL schema downloaded successfully');
    return true;
  } catch (error) {
    console.log(`  ⚠ Schema download failed (is backend running?): ${error.message}`);
    console.log('    Run manually: pnpm saas webapp graphql download-schema');
    return false;
  }
}

/**
 * Restart development servers
 * @param {Object} options - Options for which servers to restart
 * @param {boolean} options.webapp - Restart webapp dev server
 * @param {boolean} options.backend - Restart backend dev server
 * @returns {Promise<boolean>} Success status
 */
async function restartDevServers(options = { webapp: true, backend: false }) {
  try {
    if (options.backend) {
      console.log('  ⏳ Restarting backend server...');
      execSync('docker compose restart backend', {
        cwd: ROOT_DIR,
        stdio: 'pipe',
      });
      console.log('  ✓ Backend server restarted');
    }

    if (options.webapp) {
      console.log('  ⏳ Restarting webapp server...');
      // Vite has HMR, so we just need to touch a file to trigger reload
      // Or we can restart the container if running in Docker
      try {
        execSync('docker compose restart webapp', {
          cwd: ROOT_DIR,
          stdio: 'pipe',
          timeout: 5000,
        });
        console.log('  ✓ Webapp server restarted');
      } catch {
        // Webapp might not be in Docker, that's fine - Vite HMR will pick up changes
        console.log('  ✓ Webapp will reload via HMR');
      }
    }

    return true;
  } catch (error) {
    console.log(`  ⚠ Server restart failed: ${error.message}`);
    return false;
  }
}

/**
 * Open files in the user's IDE/editor
 * @param {string[]} filePaths - Array of file paths to open
 * @param {string} editor - Editor command (default: 'code' for VS Code)
 * @param {number} maxFiles - Maximum number of files to open
 * @returns {Promise<boolean>} Success status
 */
async function openInEditor(filePaths, editor = 'code', maxFiles = 5) {
  if (!filePaths || filePaths.length === 0) return true;

  try {
    // Limit the number of files to open
    const filesToOpen = filePaths.slice(0, maxFiles);
    
    // Open files in editor
    const files = filesToOpen.join(' ');
    spawn(editor, filesToOpen, {
      detached: true,
      stdio: 'ignore',
    }).unref();

    console.log(`  ✓ Opened ${filesToOpen.length} file(s) in ${editor}`);
    if (filePaths.length > maxFiles) {
      console.log(`    (${filePaths.length - maxFiles} more files not opened)`);
    }
    return true;
  } catch (error) {
    console.log(`  ⚠ Could not open files in editor: ${error.message}`);
    return false;
  }
}

/**
 * Update route configuration file with new routes
 * @param {string} configPath - Path to route config file
 * @param {string} routeName - Name of the route (camelCase)
 * @param {Object} routeConfig - Route configuration object
 * @returns {Promise<boolean>} Success status
 */
async function updateRouteConfig(configPath, routeName, routeConfig) {
  try {
    const fullPath = path.resolve(WEBAPP_DIR, configPath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`  ⚠ Route config not found: ${configPath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    
    // Check if route already exists
    if (content.includes(`${routeName}:`)) {
      console.log(`  ⚠ Route "${routeName}" already exists in config`);
      return false;
    }

    // Find the injection point
    const injectionPattern = /\/\/<-- INJECT ROUTE DEFINITION -->/;
    if (!injectionPattern.test(content)) {
      console.log(`  ⚠ Injection point not found in route config`);
      console.log('    Add route manually or add "//<-- INJECT ROUTE DEFINITION -->" comment');
      return false;
    }

    // Generate route config string
    const routeString = `${routeName}: nestedPath('${routeConfig.path}', {
    list: '',
    details: ':id',
    edit: ':id/edit',
    add: 'add',
  }),
  //<-- INJECT ROUTE DEFINITION -->`;

    content = content.replace(injectionPattern, routeString);
    fs.writeFileSync(fullPath, content, 'utf-8');

    console.log(`  ✓ Added route "${routeName}" to config`);
    return true;
  } catch (error) {
    console.log(`  ⚠ Could not update route config: ${error.message}`);
    return false;
  }
}

/**
 * Run Django migrations for a specific app
 * @param {string} appName - Name of the Django app
 * @returns {Promise<boolean>} Success status
 */
async function runDjangoMigrations(appName) {
  try {
    console.log(`  ⏳ Creating migrations for ${appName}...`);
    execSync(`pnpm saas backend makemigrations`, {
      cwd: ROOT_DIR,
      stdio: 'pipe',
    });
    console.log(`  ✓ Migrations created for ${appName}`);

    console.log(`  ⏳ Applying migrations...`);
    execSync(`pnpm saas backend migrate`, {
      cwd: ROOT_DIR,
      stdio: 'pipe',
    });
    console.log(`  ✓ Migrations applied successfully`);
    return true;
  } catch (error) {
    console.log(`  ⚠ Migrations failed: ${error.message}`);
    console.log('    Run manually: pnpm saas backend makemigrations && pnpm saas backend migrate');
    return false;
  }
}

/**
 * Create a Plop action that runs post-generation tasks
 * @param {Object} config - Configuration for post-generation actions
 * @returns {Function} Plop action function
 */
function createPostGenerationAction(config = {}) {
  const defaultConfig = {
    format: true,
    codegen: false,
    downloadSchema: false,
    restartServers: false,
    openInEditor: true,
    editor: 'code',
    maxOpenFiles: 5,
    migrations: false,
    appName: null,
  };

  const finalConfig = { ...defaultConfig, ...config };

  return async function postGenerationAction(answers, plopConfig, plop) {
    console.log('\n📦 Running post-generation tasks...\n');

    const results = {
      format: null,
      codegen: null,
      downloadSchema: null,
      restartServers: null,
      openInEditor: null,
      migrations: null,
    };

    // Collect generated file paths from previous actions
    const generatedFiles = [];
    // Note: In actual usage, file paths would need to be passed through answers or config

    if (finalConfig.format && generatedFiles.length > 0) {
      results.format = await formatFiles(generatedFiles);
    }

    if (finalConfig.downloadSchema) {
      results.downloadSchema = await downloadSchema();
    }

    if (finalConfig.codegen) {
      results.codegen = await runGraphQLCodegen();
    }

    if (finalConfig.migrations && finalConfig.appName) {
      results.migrations = await runDjangoMigrations(finalConfig.appName);
    }

    if (finalConfig.restartServers) {
      results.restartServers = await restartDevServers({
        webapp: true,
        backend: finalConfig.migrations,
      });
    }

    if (finalConfig.openInEditor && generatedFiles.length > 0) {
      results.openInEditor = await openInEditor(
        generatedFiles,
        finalConfig.editor,
        finalConfig.maxOpenFiles
      );
    }

    console.log('\n✅ Post-generation tasks completed!\n');

    return 'Post-generation tasks completed';
  };
}

/**
 * Collect file paths from plop actions for post-processing
 * @param {Array} actions - Array of plop actions
 * @param {Object} answers - Answers from prompts
 * @param {Object} plop - Plop instance
 * @returns {string[]} Array of generated file paths
 */
function collectGeneratedPaths(actions, answers, plop) {
  const paths = [];
  
  for (const action of actions) {
    if (action.type === 'add' && action.path) {
      // Render the path template with answers
      const renderedPath = plop.renderString(action.path, answers);
      paths.push(renderedPath);
    }
  }

  return paths;
}

module.exports = {
  formatFiles,
  runGraphQLCodegen,
  downloadSchema,
  restartDevServers,
  openInEditor,
  updateRouteConfig,
  runDjangoMigrations,
  createPostGenerationAction,
  collectGeneratedPaths,
};
