const path = require('path');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  const emailsNamespace = '../webapp-libs/webapp-emails/src';
  const templates = path.join(emailsNamespace, 'templates', '{{ camelCase name }}');

  plop.setGenerator('email', {
    description: 'Generate an email template',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Email template name (e.g., "WelcomeEmail", "PasswordReset"):',
        validate: plop.validators.required,
      },
      {
        type: 'input',
        name: 'subject',
        message: 'Email subject line:',
        default: (answers) => `{{ pascalCase name }} - Your Subject Here`,
      },
    ],
    actions: [
      {
        type: 'add',
        path: `${templates}/index.ts`,
        templateFile: path.join(templatesPath, 'index.hbs'),
      },
      {
        type: 'add',
        path: `${templates}/{{ camelCase name }}.component.tsx`,
        templateFile: path.join(templatesPath, 'component.hbs'),
      },
      {
        type: 'add',
        path: `${templates}/{{ camelCase name }}.stories.tsx`,
        templateFile: path.join(templatesPath, 'stories.hbs'),
      },
      {
        type: 'modify',
        path: `${emailsNamespace}/types.ts`,
        pattern: /(\/\/<-- INJECT EMAIL TYPE -->)/g,
        template: "{{ constantCase name }} = '{{ constantCase name }}',\n  $1",
      },
      {
        type: 'modify',
        path: `${emailsNamespace}/templates/templates.config.ts`,
        pattern: /(\/\/<-- INJECT EMAIL TEMPLATE IMPORT -->)/g,
        template: "import * as {{ pascalCase name }} from './{{ camelCase name }}';\n$1",
      },
      {
        type: 'modify',
        path: `${emailsNamespace}/templates/templates.config.ts`,
        pattern: /(\/\/<-- INJECT EMAIL TEMPLATE -->)/g,
        template: '[EmailTemplateType.{{ constantCase name }}]: {{ pascalCase name }},\n  $1',
      },
      {
        type: 'logSuccess',
        message: `
✅ Email template "{{ pascalCase name }}" created successfully!

📁 Created files:
   - ${templates}/index.ts
   - ${templates}/{{ camelCase name }}.component.tsx
   - ${templates}/{{ camelCase name }}.stories.tsx

🔧 Next steps:
   1. The email type was added to webapp-emails/src/types.ts
   2. The template was registered in webapp-emails/src/templates/templates.config.ts
   3. Customize the email content and styling
   4. Test the email using Storybook
`,
      },
    ],
  });
};
