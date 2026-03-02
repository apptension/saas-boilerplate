const path = require('path');
const { Str } = require('@supercharge/strings');
const { complement, isEmpty } = require('ramda');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  const componentDirectory = 'src/{{ directory }}/{{ camelCase name }}';

  plop.setGenerator('component', {
    description: 'Generate a React component with tests and Storybook stories',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (e.g., UserProfile):',
        validate: plop.validators.required,
      },
      {
        type: 'directory',
        name: 'directory',
        basePath: 'src',
        message: "Component's directory:",
      },
      {
        type: 'confirm',
        name: 'hasProps',
        message: 'Does this component have props?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withGraphQL',
        message: 'Include GraphQL operations file?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'withHook',
        message: 'Include a custom hook file?',
        default: false,
      },
    ],
    actions: (data) => {
      const actions = [
        // Index file
        {
          type: 'add',
          path: `${componentDirectory}/index.ts`,
          templateFile: path.join(templatesPath, 'index.hbs'),
        },
        // Main component
        {
          type: 'add',
          path: `${componentDirectory}/{{ camelCase name }}.component.tsx`,
          templateFile: path.join(templatesPath, 'component.hbs'),
        },
        // Storybook stories
        {
          type: 'add',
          path: `${componentDirectory}/{{ camelCase name }}.stories.tsx`,
          templateFile: path.join(templatesPath, 'stories.hbs'),
          data: {
            storyTitleNamespace: (() => {
              const rules = [
                { path: 'shared/components', base: 'Shared' },
                { path: 'routes', base: 'Routes' },
                { path: 'components', base: 'Components' },
              ];

              for (const { path: rulePath, base } of rules) {
                if (data.directory.startsWith(rulePath)) {
                  const nestedComponentsPaths = data.directory
                    .slice(rulePath.length + 1)
                    .split('/')
                    .filter(complement(isEmpty))
                    .map((name) => Str(name).pascal().get());

                  return [base, ...nestedComponentsPaths, ''].join('/');
                }
              }

              // Default namespace based on first directory segment
              const firstSegment = data.directory.split('/')[0];
              return firstSegment ? `${Str(firstSegment).pascal().get()}/` : '';
            })(),
          },
        },
        // Test file
        {
          type: 'add',
          path: `${componentDirectory}/__tests__/{{ camelCase name }}.component.spec.tsx`,
          templateFile: path.join(templatesPath, '__tests__/component.spec.hbs'),
        },
      ];

      // Optional GraphQL file
      if (data.withGraphQL) {
        actions.push({
          type: 'add',
          path: `${componentDirectory}/{{ camelCase name }}.graphql.ts`,
          templateFile: path.join(templatesPath, 'graphql.hbs'),
        });
      }

      // Optional hook file
      if (data.withHook) {
        actions.push({
          type: 'add',
          path: `${componentDirectory}/{{ camelCase name }}.hook.ts`,
          templateFile: path.join(templatesPath, 'hook.hbs'),
        });
      }

      // Success message
      actions.push({
        type: 'logSuccess',
        message: `✅ Component "{{ pascalCase name }}" created successfully!\n\n   Created files:\n   - ${componentDirectory}/index.ts\n   - ${componentDirectory}/{{ camelCase name }}.component.tsx\n   - ${componentDirectory}/{{ camelCase name }}.stories.tsx\n   - ${componentDirectory}/__tests__/{{ camelCase name }}.component.spec.tsx${data.withGraphQL ? `\n   - ${componentDirectory}/{{ camelCase name }}.graphql.ts` : ''}${data.withHook ? `\n   - ${componentDirectory}/{{ camelCase name }}.hook.ts` : ''}`,
      });

      return actions;
    },
  });
};
