const promptDirectory = require('inquirer-directory');
const { Str } = require('@supercharge/strings');

module.exports = function (plop) {
  // Register custom prompts
  plop.setPrompt('directory', promptDirectory);

  // ========================
  // Custom Helpers
  // ========================

  // Append helper for template strings
  plop.setHelper('append', (text) => text);

  // Check if value equals another value
  plop.setHelper('eq', (a, b) => a === b);

  // Check if value is truthy
  plop.setHelper('if_eq', function (a, b, opts) {
    return a === b ? opts.fn(this) : opts.inverse(this);
  });

  // Join array with separator
  plop.setHelper('join', (arr, sep) => (Array.isArray(arr) ? arr.join(sep) : arr));

  // Get relative path depth (for import paths)
  plop.setHelper('relativeDepth', (directory) => {
    const depth = directory.split('/').filter(Boolean).length;
    return '../'.repeat(depth + 1);
  });

  // Capitalize first letter only
  plop.setHelper('capitalize', (str) => Str(str).ucFirst().get());

  // Snake case helper for Python/Django files
  plop.setHelper('snakeCase', (str) => {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
      .replace(/\s+/g, '_');
  });

  // Constant case helper (UPPER_SNAKE_CASE)
  plop.setHelper('constantCase', (str) => {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase()
      .replace(/^_/, '')
      .replace(/\s+/g, '_');
  });

  // ========================
  // Custom Actions
  // ========================

  // Action to log success message
  plop.setActionType('logSuccess', (answers, config) => {
    // Replace template variables in message
    let message = config.message;
    Object.keys(answers).forEach((key) => {
      const value = answers[key];
      if (typeof value === 'string') {
        // Replace {{ camelCase name }} style patterns
        message = message.replace(new RegExp(`\\{\\{\\s*camelCase\\s+${key}\\s*\\}\\}`, 'g'), plop.getHelper('camelCase')(value));
        message = message.replace(new RegExp(`\\{\\{\\s*pascalCase\\s+${key}\\s*\\}\\}`, 'g'), plop.getHelper('pascalCase')(value));
        message = message.replace(new RegExp(`\\{\\{\\s*snakeCase\\s+${key}\\s*\\}\\}`, 'g'), plop.getHelper('snakeCase')(value));
        message = message.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value);
      }
    });
    console.log('\n' + message + '\n');
    return message;
  });

  // ========================
  // Input Validators
  // ========================

  const validators = {
    required: (value) => {
      if (!value || value.trim() === '') {
        return 'This field is required';
      }
      return true;
    },
    pascalCase: (value) => {
      if (!value || value.trim() === '') {
        return 'This field is required';
      }
      // Allow spaces, we'll convert to PascalCase
      return true;
    },
    hookName: (value) => {
      if (!value || value.trim() === '') {
        return 'This field is required';
      }
      // Hook names should start with 'use' (we'll add it if not present)
      return true;
    },
  };

  // Make validators available to generators
  plop.validators = validators;

  // ========================
  // Register Generators
  // ========================

  // Frontend Generators
  const frontendGenerators = [
    require('./plop/reactComponent'),
    require('./plop/reactHook'),
    require('./plop/page'),
    require('./plop/form'),
    require('./plop/modal'),
    require('./plop/table'),
    require('./plop/context'),
  ];

  // Backend Generators
  const backendGenerators = [
    require('./plop/backend'),
  ];

  // Full-Stack Generators
  const fullStackGenerators = [
    require('./plop/crud'),
  ];

  // Utility Generators
  const utilityGenerators = [
    require('./plop/icon'),
    require('./plop/notification'),
    require('./plop/email'),
  ];

  // Register all generators
  [
    ...frontendGenerators,
    ...backendGenerators,
    ...fullStackGenerators,
    ...utilityGenerators,
  ].forEach((generator) => generator(plop));

  // ========================
  // Welcome Message
  // ========================

  const CYAN = '\x1b[36m';
  const GREEN = '\x1b[32m';
  const YELLOW = '\x1b[33m';
  const MAGENTA = '\x1b[35m';
  const RESET = '\x1b[0m';
  const BOLD = '\x1b[1m';
  const DIM = '\x1b[2m';

  console.log(`
${BOLD}${CYAN}╔═══════════════════════════════════════════════════════════════╗
║             🚀 SaaS Boilerplate Code Generator                ║
╚═══════════════════════════════════════════════════════════════╝${RESET}

${BOLD}${GREEN}Frontend Generators:${RESET}
  ${CYAN}component${RESET}     React component with tests and Storybook stories
  ${CYAN}hook${RESET}          React hook (state, effect, query, mutation, custom)
  ${CYAN}page${RESET}          Page/route with navigation and skeleton
  ${CYAN}form${RESET}          Multi-field form with validation and types
  ${CYAN}modal${RESET}         Modal/dialog (confirm, form, info, custom)
  ${CYAN}table${RESET}         Data table with pagination and search
  ${CYAN}context${RESET}       Context provider with typed hook

${BOLD}${YELLOW}Backend Generators:${RESET}
  ${CYAN}backend${RESET}       Django app with model, schema, and serializers

${BOLD}${MAGENTA}Full-Stack Generators:${RESET}
  ${CYAN}crud${RESET}          Complete CRUD module (frontend + optional backend)

${BOLD}${DIM}Utility Generators:${RESET}
  ${CYAN}icon${RESET}          Register a custom SVG icon
  ${CYAN}notification${RESET}  Notification component
  ${CYAN}email${RESET}         Email template with React Email

${DIM}Run a generator: ${RESET}${CYAN}pnpm plop <generator>${RESET}
${DIM}Example: ${RESET}${CYAN}pnpm plop component${RESET}
`);
};
