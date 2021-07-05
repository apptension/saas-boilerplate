const path = require('path');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  const projectPathAbsolute = plop.getDestBasePath();
  const moduleDirectory = 'src/shared/services/api/{{ directory }}/{{ camelCase name }}';

  plop.setGenerator('apiModel', {
    description: 'Generate an API model',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Name:',
      },
      {
        type: 'directory',
        name: 'directory',
        basePath: 'src/shared/services/api',
        message: "Model's directory:",
      },
    ],
    actions: (data) => [
      {
        type: 'add',
        path: `${moduleDirectory}/index.ts`,
        templateFile: path.join(templatesPath, 'index.hbs'),
        data: {
          clientPath: path.relative(
            path.join(projectPathAbsolute, `src/shared/services/api/${data.directory}/index.ts`),
            path.join(projectPathAbsolute, 'src/shared/services/api/client')
          ),
          helpersPath: path.relative(
            path.join(projectPathAbsolute, `src/shared/services/api/${data.directory}/index.ts`),
            path.join(projectPathAbsolute, 'src/shared/services/api/helpers')
          ),
        },
      },
      {
        type: 'add',
        path: `${moduleDirectory}/types.ts`,
        templateFile: path.join(templatesPath, 'types.hbs'),
      },
      {
        type: 'add',
        path: 'src/mocks/server/handlers/{{ directory }}/{{ camelCase name }}.ts',
        templateFile: path.join(templatesPath, 'mock.hbs'),
        data: {
          relativeModulePath: path.relative(
            path.join(projectPathAbsolute, `src/mocks/server/handlers/${data.directory}`),
            path.join(projectPathAbsolute, `src/shared/services/api/${data.directory}`)
          ),
        },
      },
      {
        type: 'modify',
        path: path.join(moduleDirectory, '..', 'index.ts'),
        pattern: /(\/\/<-- IMPORT MODULE API -->)/g,
        template: "export * as {{ camelCase name }} from './{{ camelCase name }}';\n$1",
      },
      {
        type: 'modify',
        path: 'src/mocks/server/handlers/index.ts',
        pattern: /(\/\/<-- IMPORT API MODULE MOCK -->)/g,
        template: "export * from './{{ directory }}/{{ camelCase name }}';\n$1",
      },
    ],
  });
};
