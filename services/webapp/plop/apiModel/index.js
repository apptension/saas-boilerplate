const path = require('path');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  plop.setGenerator('api model', {
    description: 'Generate an API model',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Name:',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/shared/services/api/{{ camelCase name }}/index.ts',
        templateFile: path.join(templatesPath, 'index.hbs'),
      },
      {
        type: 'add',
        path: 'src/mocks/server/handlers/{{ camelCase name }}.ts',
        templateFile: path.join(templatesPath, 'mock.hbs'),
      },
      {
        type: 'add',
        path: 'src/shared/services/api/{{ camelCase name }}/types.ts',
        templateFile: path.join(templatesPath, 'types.hbs'),
      },
      {
        type: 'modify',
        path: 'src/shared/services/api/index.ts',
        pattern: /(\/\/<-- IMPORT MODULE API -->)/g,
        template: "export * as {{ camelCase name }} from './{{ camelCase name }}';\n$1",
      },
      {
        type: 'modify',
        path: 'src/mocks/server/handlers/index.ts',
        pattern: /(\/\/<-- IMPORT API MODULE MOCK -->)/g,
        template: "export * from './{{ camelCase name }}';\n$1",
      },
    ],
  });
};
