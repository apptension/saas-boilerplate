const path = require('path');
const { getTemplateChoices, getTemplateFields, getFieldsSummary } = require('../lib/entityTemplates');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  const tableDirectory = 'src/{{ directory }}/{{ camelCase name }}Table';

  plop.setGenerator('table', {
    description: 'Generate a Data Table component with pagination',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Table name (e.g., "Users", "Products", "Orders"):',
        validate: plop.validators.required,
      },
      {
        type: 'directory',
        name: 'directory',
        basePath: 'src',
        message: "Table's directory:",
      },
      {
        type: 'list',
        name: 'template',
        message: 'Column structure from template:',
        choices: getTemplateChoices(),
        default: 'custom',
      },
      {
        type: 'confirm',
        name: 'withPagination',
        message: 'Include pagination?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withSearch',
        message: 'Include search/filter?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withRowActions',
        message: 'Include row actions (edit/delete)?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withGraphQL',
        message: 'Generate GraphQL query?',
        default: true,
      },
    ],
    actions: (data) => {
      // Get fields from template
      const fields = getTemplateFields(data.template);
      data.fields = fields;
      data.hasFields = fields.length > 0;
      data.fieldsSummary = getFieldsSummary(fields);

      const actions = [
        // Index file
        {
          type: 'add',
          path: `${tableDirectory}/index.ts`,
          templateFile: path.join(templatesPath, 'index.hbs'),
        },
        // Table component
        {
          type: 'add',
          path: `${tableDirectory}/{{ camelCase name }}Table.component.tsx`,
          templateFile: path.join(templatesPath, 'table.component.hbs'),
        },
        // Table row component
        {
          type: 'add',
          path: `${tableDirectory}/{{ camelCase name }}TableRow.component.tsx`,
          templateFile: path.join(templatesPath, 'tableRow.component.hbs'),
        },
        // Table skeleton
        {
          type: 'add',
          path: `${tableDirectory}/{{ camelCase name }}TableSkeleton.component.tsx`,
          templateFile: path.join(templatesPath, 'tableSkeleton.component.hbs'),
        },
        // Stories
        {
          type: 'add',
          path: `${tableDirectory}/{{ camelCase name }}Table.stories.tsx`,
          templateFile: path.join(templatesPath, 'table.stories.hbs'),
        },
        // Test
        {
          type: 'add',
          path: `${tableDirectory}/__tests__/{{ camelCase name }}Table.component.spec.tsx`,
          templateFile: path.join(templatesPath, '__tests__/table.spec.hbs'),
        },
      ];

      // Optional GraphQL
      if (data.withGraphQL) {
        actions.push({
          type: 'add',
          path: `${tableDirectory}/{{ camelCase name }}Table.graphql.ts`,
          templateFile: path.join(templatesPath, 'table.graphql.hbs'),
        });
      }

      // Success message
      actions.push({
        type: 'logSuccess',
        message: `
✅ Table "{{ pascalCase name }}Table" created successfully!

📁 Created files:
   - ${tableDirectory}/index.ts
   - ${tableDirectory}/{{ camelCase name }}Table.component.tsx
   - ${tableDirectory}/{{ camelCase name }}TableRow.component.tsx
   - ${tableDirectory}/{{ camelCase name }}TableSkeleton.component.tsx
   - ${tableDirectory}/{{ camelCase name }}Table.stories.tsx
   - ${tableDirectory}/__tests__/{{ camelCase name }}Table.component.spec.tsx${data.withGraphQL ? `\n   - ${tableDirectory}/{{ camelCase name }}Table.graphql.ts` : ''}

📝 Features:${data.withPagination ? '\n   - Pagination with configurable page size' : ''}${data.withSearch ? '\n   - Search/filter functionality' : ''}${data.withRowActions ? '\n   - Row actions (edit/delete)' : ''}

📝 Usage:

   import { {{ pascalCase name }}Table } from './${data.directory}/{{ camelCase name }}Table';

   <{{ pascalCase name }}Table data={items} loading={isLoading} />
`,
      });

      return actions;
    },
  });
};
