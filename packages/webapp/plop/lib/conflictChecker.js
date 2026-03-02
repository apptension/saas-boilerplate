/**
 * Conflict detection utilities for PLOP generators
 * 
 * Checks for existing files and naming conflicts before generation
 */

const path = require('path');
const fs = require('fs');

/**
 * Check if a file already exists
 * @param {string} filePath - Path to check
 * @returns {boolean} True if file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Check multiple files for existence
 * @param {string[]} filePaths - Paths to check
 * @returns {string[]} Array of paths that exist
 */
function findExistingFiles(filePaths) {
  return filePaths.filter((p) => fs.existsSync(p));
}

/**
 * Check if a route name already exists in routes config
 * @param {string} routesConfigPath - Path to routes config file
 * @param {string} routeName - Route name to check
 * @returns {boolean} True if route exists
 */
function routeNameExists(routesConfigPath, routeName) {
  try {
    if (!fs.existsSync(routesConfigPath)) {
      return false;
    }
    
    const content = fs.readFileSync(routesConfigPath, 'utf-8');
    // Check for pattern like "routeName:" or "routeName :"
    const pattern = new RegExp(`\\b${routeName}\\s*:`);
    return pattern.test(content);
  } catch {
    return false;
  }
}

/**
 * Check if a Django app already exists
 * @param {string} appsPath - Path to Django apps directory
 * @param {string} appName - App name to check
 * @returns {boolean} True if app exists
 */
function djangoAppExists(appsPath, appName) {
  const appPath = path.join(appsPath, appName);
  return fs.existsSync(appPath);
}

/**
 * Generate a unique name by adding a suffix
 * @param {string} baseName - Original name
 * @param {Function} existsChecker - Function to check if name exists
 * @returns {string} Unique name
 */
function generateUniqueName(baseName, existsChecker) {
  let name = baseName;
  let counter = 1;
  
  while (existsChecker(name)) {
    name = `${baseName}${counter}`;
    counter++;
  }
  
  return name;
}

/**
 * Conflict check result
 * @typedef {Object} ConflictCheckResult
 * @property {boolean} hasConflicts - True if any conflicts found
 * @property {string[]} existingFiles - Array of existing file paths
 * @property {boolean} routeConflict - True if route name conflict
 * @property {boolean} appConflict - True if Django app conflict
 * @property {string[]} suggestions - Array of suggested fixes
 */

/**
 * Perform comprehensive conflict check
 * @param {Object} options - Check options
 * @param {string[]} options.filePaths - File paths to check
 * @param {string} options.routesConfigPath - Path to routes config
 * @param {string} options.routeName - Route name to check
 * @param {string} options.appsPath - Path to Django apps
 * @param {string} options.appName - Django app name to check
 * @returns {ConflictCheckResult} Conflict check result
 */
function checkConflicts(options = {}) {
  const result = {
    hasConflicts: false,
    existingFiles: [],
    routeConflict: false,
    appConflict: false,
    suggestions: [],
  };
  
  // Check files
  if (options.filePaths && options.filePaths.length > 0) {
    result.existingFiles = findExistingFiles(options.filePaths);
    if (result.existingFiles.length > 0) {
      result.hasConflicts = true;
      result.suggestions.push(`${result.existingFiles.length} file(s) already exist and would be overwritten`);
    }
  }
  
  // Check route name
  if (options.routesConfigPath && options.routeName) {
    result.routeConflict = routeNameExists(options.routesConfigPath, options.routeName);
    if (result.routeConflict) {
      result.hasConflicts = true;
      result.suggestions.push(`Route "${options.routeName}" already exists in routes config`);
    }
  }
  
  // Check Django app
  if (options.appsPath && options.appName) {
    result.appConflict = djangoAppExists(options.appsPath, options.appName);
    if (result.appConflict) {
      result.hasConflicts = true;
      result.suggestions.push(`Django app "${options.appName}" already exists`);
    }
  }
  
  return result;
}

/**
 * Format conflict check result for display
 * @param {ConflictCheckResult} result - Conflict check result
 * @returns {string} Formatted message
 */
function formatConflictMessage(result) {
  if (!result.hasConflicts) {
    return '✓ No conflicts detected';
  }
  
  let message = '⚠️ Conflicts detected:\n\n';
  
  if (result.existingFiles.length > 0) {
    message += 'Existing files that would be overwritten:\n';
    result.existingFiles.forEach((file) => {
      message += `  - ${file}\n`;
    });
    message += '\n';
  }
  
  if (result.routeConflict) {
    message += '• Route name already exists in routes configuration\n';
  }
  
  if (result.appConflict) {
    message += '• Django app already exists\n';
  }
  
  return message;
}

module.exports = {
  fileExists,
  findExistingFiles,
  routeNameExists,
  djangoAppExists,
  generateUniqueName,
  checkConflicts,
  formatConflictMessage,
};
