const path = require('path');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  const emailsNamespace = '../webapp-libs/webapp-emails/src';
  const templates = path.join(emailsNamespace, 'templates', '{{ camelCase name }}');

  plop.setGenerator('email', {
    description: 'Generate an email',
    prompts: [
      {
        type: 'name',
        name: 'name',
        message: 'Name:',
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
    ],
  });
};
