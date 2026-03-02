const path = require('path');
const { getTemplateChoices, getTemplateFields, getFieldsSummary } = require('../lib/entityTemplates');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  const formDirectory = 'src/{{ directory }}/{{ camelCase name }}Form';

  plop.setGenerator('form', {
    description: 'Generate a multi-field form component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Form name (e.g., "UserProfile", "ContactInfo", "Settings"):',
        validate: plop.validators.required,
      },
      {
        type: 'directory',
        name: 'directory',
        basePath: 'src',
        message: "Form's directory:",
      },
      {
        type: 'list',
        name: 'template',
        message: 'Start from a template:',
        choices: getTemplateChoices(),
        default: 'custom',
      },
      {
        type: 'confirm',
        name: 'withGraphQL',
        message: 'Generate GraphQL mutation?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'withCard',
        message: 'Wrap form in a Card component?',
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
          path: `${formDirectory}/index.ts`,
          templateFile: path.join(templatesPath, 'index.hbs'),
        },
        // Form component
        {
          type: 'add',
          path: `${formDirectory}/{{ camelCase name }}Form.component.tsx`,
          templateFile: path.join(templatesPath, 'form.component.hbs'),
        },
        // Form hook
        {
          type: 'add',
          path: `${formDirectory}/{{ camelCase name }}Form.hook.ts`,
          templateFile: path.join(templatesPath, 'form.hook.hbs'),
        },
        // Types
        {
          type: 'add',
          path: `${formDirectory}/{{ camelCase name }}Form.types.ts`,
          templateFile: path.join(templatesPath, 'form.types.hbs'),
        },
        // Stories
        {
          type: 'add',
          path: `${formDirectory}/{{ camelCase name }}Form.stories.tsx`,
          templateFile: path.join(templatesPath, 'form.stories.hbs'),
        },
        // Test
        {
          type: 'add',
          path: `${formDirectory}/__tests__/{{ camelCase name }}Form.component.spec.tsx`,
          templateFile: path.join(templatesPath, '__tests__/form.spec.hbs'),
        },
      ];

      // Optional GraphQL
      if (data.withGraphQL) {
        actions.push({
          type: 'add',
          path: `${formDirectory}/{{ camelCase name }}Form.graphql.ts`,
          templateFile: path.join(templatesPath, 'form.graphql.hbs'),
        });
      }

      // Success message
      const templateInfo = data.template !== 'custom' 
        ? `\n   Template: ${data.template}\n   Fields:\n${data.fieldsSummary}` 
        : '';

      actions.push({
        type: 'logSuccess',
        message: `
✅ Form "{{ pascalCase name }}Form" created successfully!

📁 Created files:
   - ${formDirectory}/index.ts
   - ${formDirectory}/{{ camelCase name }}Form.component.tsx
   - ${formDirectory}/{{ camelCase name }}Form.hook.ts
   - ${formDirectory}/{{ camelCase name }}Form.types.ts
   - ${formDirectory}/{{ camelCase name }}Form.stories.tsx
   - ${formDirectory}/__tests__/{{ camelCase name }}Form.component.spec.tsx${data.withGraphQL ? `\n   - ${formDirectory}/{{ camelCase name }}Form.graphql.ts` : ''}
${templateInfo}

📝 Usage:

   import { {{ pascalCase name }}Form } from './${data.directory}/{{ camelCase name }}Form';

   <{{ pascalCase name }}Form
     onSubmit={(data) => console.log(data)}
     loading={false}
   />
`,
      });

      return actions;
    },
  });
};
