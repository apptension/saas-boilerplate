/**
 * Preview mode utilities for PLOP generators
 * 
 * Shows what files will be created before generation
 */

const path = require('path');
const fs = require('fs');

/**
 * Build a tree representation of paths
 * @param {string[]} paths - Array of file paths
 * @returns {string} Tree representation
 */
function buildFileTree(paths) {
  const tree = {};
  
  // Build tree structure
  paths.forEach((filePath) => {
    const parts = filePath.split('/').filter(Boolean);
    let current = tree;
    
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {};
      }
      if (current[part] !== null) {
        current = current[part];
      }
    });
  });
  
  // Convert tree to string
  function treeToString(node, prefix = '', isLast = true) {
    const entries = Object.entries(node);
    let result = '';
    
    entries.forEach(([name, children], index) => {
      const isLastEntry = index === entries.length - 1;
      const connector = isLastEntry ? '└── ' : '├── ';
      const childPrefix = isLastEntry ? '    ' : '│   ';
      
      result += prefix + connector + name + '\n';
      
      if (children !== null) {
        result += treeToString(children, prefix + childPrefix, isLastEntry);
      }
    });
    
    return result;
  }
  
  return treeToString(tree);
}

/**
 * Check for existing files that would be overwritten
 * @param {string[]} paths - Array of file paths to check
 * @param {string} basePath - Base path for resolution
 * @returns {string[]} Array of existing file paths
 */
function checkExistingFiles(paths, basePath) {
  const existing = [];
  
  paths.forEach((filePath) => {
    const fullPath = path.resolve(basePath, filePath);
    if (fs.existsSync(fullPath)) {
      existing.push(filePath);
    }
  });
  
  return existing;
}

/**
 * Generate preview message for files that will be created
 * @param {Array} actions - Plop actions array
 * @param {Object} answers - Answers from prompts
 * @param {Object} plop - Plop instance
 * @returns {string} Preview message
 */
function generatePreview(actions, answers, plop) {
  const filePaths = [];
  
  actions.forEach((action) => {
    if (action.type === 'add' && action.path) {
      // Render the path template with answers
      const renderedPath = plop.renderString(action.path, answers);
      filePaths.push(renderedPath);
    }
  });
  
  const tree = buildFileTree(filePaths);
  
  return `
📁 Files to be created (${filePaths.length} files):

${tree}
  `;
}

/**
 * Create a preview action that can be inserted before generation
 * @param {Function} getActions - Function that returns actions based on answers
 * @returns {Function} Plop action function
 */
function createPreviewAction(getActions) {
  return function previewAction(answers, config, plop) {
    const actions = getActions(answers);
    const preview = generatePreview(actions, answers, plop);
    
    console.log(preview);
    
    return 'Preview displayed';
  };
}

/**
 * Create confirm prompt after preview
 * @returns {Object} Inquirer prompt configuration
 */
function createPreviewConfirmPrompt() {
  return {
    type: 'confirm',
    name: 'confirmGeneration',
    message: 'Proceed with generation?',
    default: true,
  };
}

/**
 * Filter actions based on confirmation
 * @param {Array} actions - Original actions array
 * @param {Object} answers - Answers including confirmGeneration
 * @returns {Array} Filtered actions
 */
function filterActionsOnConfirm(actions, answers) {
  if (answers.confirmGeneration === false) {
    return [
      {
        type: 'logSuccess',
        message: '❌ Generation cancelled.',
      },
    ];
  }
  return actions;
}

module.exports = {
  buildFileTree,
  checkExistingFiles,
  generatePreview,
  createPreviewAction,
  createPreviewConfirmPrompt,
  filterActionsOnConfirm,
};
