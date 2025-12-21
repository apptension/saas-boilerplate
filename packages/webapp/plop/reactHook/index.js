const path = require('path');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  const hookDirectory = 'src/{{ directory }}/{{ hookName }}';

  plop.setGenerator('hook', {
    description: 'Generate a React hook with tests',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Hook name (without "use" prefix, e.g., "FormValidation"):',
        validate: plop.validators.required,
        // Transform to ensure proper hook naming
        transformer: (input) => {
          if (!input) return input;
          // Remove 'use' prefix if provided
          const cleanName = input.replace(/^use/i, '');
          return `use${cleanName.charAt(0).toUpperCase()}${cleanName.slice(1)}`;
        },
      },
      {
        type: 'directory',
        name: 'directory',
        basePath: 'src',
        message: "Hook's directory:",
      },
      {
        type: 'list',
        name: 'hookType',
        message: 'What type of hook do you want to create?',
        choices: [
          { name: 'State hook (useState-based)', value: 'state' },
          { name: 'Effect hook (side effects)', value: 'effect' },
          { name: 'Callback hook (memoized functions)', value: 'callback' },
          { name: 'Query hook (GraphQL query)', value: 'query' },
          { name: 'Mutation hook (GraphQL mutation)', value: 'mutation' },
          { name: 'Custom (empty template)', value: 'custom' },
        ],
        default: 'state',
      },
    ],
    actions: (data) => {
      // Ensure hook name starts with 'use'
      const rawName = data.name.replace(/^use/i, '');
      data.hookName = `use${rawName.charAt(0).toUpperCase()}${rawName.slice(1)}`;
      data.hookBaseName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      const actions = [
        // Index file
        {
          type: 'add',
          path: `${hookDirectory}/index.ts`,
          templateFile: path.join(templatesPath, 'index.hbs'),
        },
        // Hook file (based on type)
        {
          type: 'add',
          path: `${hookDirectory}/{{ hookName }}.hook.ts`,
          templateFile: path.join(templatesPath, `hook.${data.hookType}.hbs`),
        },
        // Test file
        {
          type: 'add',
          path: `${hookDirectory}/__tests__/{{ hookName }}.hook.spec.ts`,
          templateFile: path.join(templatesPath, '__tests__/hook.spec.hbs'),
        },
        // Success message
        {
          type: 'logSuccess',
          message: `✅ Hook "{{ hookName }}" created successfully!\n\n   Created files:\n   - ${hookDirectory}/index.ts\n   - ${hookDirectory}/{{ hookName }}.hook.ts\n   - ${hookDirectory}/__tests__/{{ hookName }}.hook.spec.ts\n\n   Usage:\n   import { {{ hookName }} } from './${data.directory}/{{ hookName }}';`,
        },
      ];

      return actions;
    },
  });
};
