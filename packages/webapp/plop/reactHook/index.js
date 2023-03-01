const path = require('path');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  const containerDirectory = 'src/{{ directory }}/{{ camelCase name }}';
  plop.setGenerator('hook', {
    description: 'Generate a React hook',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Name:',
      },
      {
        type: 'directory',
        name: 'directory',
        basePath: 'src',
        message: "Hook's directory:",
      },
    ],
    actions: [
      {
        type: 'add',
        path: `${containerDirectory}/index.ts`,
        templateFile: path.join(templatesPath, 'index.hbs'),
      },
      {
        type: 'add',
        path: `${containerDirectory}/{{ camelCase name }}.hook.ts`,
        templateFile: path.join(templatesPath, 'hook.hbs'),
      },
      {
        type: 'add',
        path: `${containerDirectory}/__tests__/{{ camelCase name }}.hook.spec.ts`,
        templateFile: path.join(templatesPath, '__tests__/hook.spec.hbs'),
      },
      {
        type: 'modify',
        path: 'src/shared/hooks/index.ts',
        pattern: /(\/\/<-- EXPORT HOOK -->)/g,
        template: "export { {{ camelCase name }} } from './{{ camelCase name }}';\n$1",
      },
    ],
  });
};
