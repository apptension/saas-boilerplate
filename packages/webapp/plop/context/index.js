const path = require('path');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  const contextDirectory = 'src/{{ directory }}/{{ camelCase name }}';

  plop.setGenerator('context', {
    description: 'Generate a React Context Provider with typed hook',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Context name (e.g., "Theme", "Cart", "UserPreferences"):',
        validate: plop.validators.required,
      },
      {
        type: 'directory',
        name: 'directory',
        basePath: 'src',
        message: "Context's directory:",
      },
      {
        type: 'list',
        name: 'pattern',
        message: 'State management pattern:',
        choices: [
          { name: 'useState (simple state)', value: 'state' },
          { name: 'useReducer (complex state with actions)', value: 'reducer' },
          { name: 'External store (Zustand-like pattern)', value: 'store' },
        ],
        default: 'state',
      },
      {
        type: 'confirm',
        name: 'withPersistence',
        message: 'Include localStorage persistence?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'withReset',
        message: 'Include reset functionality?',
        default: true,
      },
    ],
    actions: (data) => {
      const actions = [
        // Index file
        {
          type: 'add',
          path: `${contextDirectory}/index.ts`,
          templateFile: path.join(templatesPath, 'index.hbs'),
        },
        // Context based on pattern
        {
          type: 'add',
          path: `${contextDirectory}/{{ camelCase name }}.context.tsx`,
          templateFile: path.join(templatesPath, `context.${data.pattern}.hbs`),
        },
        // Hook
        {
          type: 'add',
          path: `${contextDirectory}/use{{ pascalCase name }}.hook.ts`,
          templateFile: path.join(templatesPath, 'hook.hbs'),
        },
        // Types
        {
          type: 'add',
          path: `${contextDirectory}/{{ camelCase name }}.types.ts`,
          templateFile: path.join(templatesPath, `types.${data.pattern}.hbs`),
        },
        // Test
        {
          type: 'add',
          path: `${contextDirectory}/__tests__/{{ camelCase name }}.context.spec.tsx`,
          templateFile: path.join(templatesPath, '__tests__/context.spec.hbs'),
        },
        // Success message
        {
          type: 'logSuccess',
          message: `
✅ Context "{{ pascalCase name }}" created successfully!

📁 Created files:
   - ${contextDirectory}/index.ts
   - ${contextDirectory}/{{ camelCase name }}.context.tsx
   - ${contextDirectory}/use{{ pascalCase name }}.hook.ts
   - ${contextDirectory}/{{ camelCase name }}.types.ts
   - ${contextDirectory}/__tests__/{{ camelCase name }}.context.spec.tsx

📝 Usage:

   // Wrap your app or component tree with the provider:
   import { {{ pascalCase name }}Provider } from './${data.directory}/{{ camelCase name }}';

   <{{ pascalCase name }}Provider>
     <App />
   </{{ pascalCase name }}Provider>

   // Use the context in child components:
   import { use{{ pascalCase name }} } from './${data.directory}/{{ camelCase name }}';

   const { state, setState } = use{{ pascalCase name }}();
`,
        },
      ];

      return actions;
    },
  });
};
