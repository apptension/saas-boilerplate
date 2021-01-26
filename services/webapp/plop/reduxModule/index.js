const path = require('path');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  plop.setGenerator('module', {
    description: 'Generate a Redux module',
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
        path: 'src/modules/{{ camelCase name }}/index.ts',
        templateFile: path.join(templatesPath, 'index.hbs'),
      },
      {
        type: 'add',
        path: 'src/modules/{{ camelCase name }}/{{ camelCase name }}.actions.ts',
        templateFile: path.join(templatesPath, 'actions.hbs'),
      },
      {
        type: 'add',
        path: 'src/modules/{{ camelCase name }}/{{ camelCase name }}.reducer.ts',
        templateFile: path.join(templatesPath, 'reducer.hbs'),
      },
      {
        type: 'add',
        path: 'src/modules/{{ camelCase name }}/{{ camelCase name }}.selectors.ts',
        templateFile: path.join(templatesPath, 'selectors.hbs'),
      },
      {
        type: 'add',
        path: 'src/modules/{{ camelCase name }}/{{ camelCase name }}.types.ts',
        templateFile: path.join(templatesPath, 'types.hbs'),
      },
      {
        type: 'add',
        path: 'src/modules/{{ camelCase name }}/{{ camelCase name }}.sagas.ts',
        templateFile: path.join(templatesPath, 'sagas.hbs'),
      },
      {
        type: 'add',
        path: 'src/modules/{{ camelCase name }}/__tests__/{{ camelCase name }}.reducer.spec.ts',
        templateFile: path.join(templatesPath, '__tests__/reducer.spec.hbs'),
      },
      {
        type: 'add',
        path: 'src/modules/{{ camelCase name }}/__tests__/{{ camelCase name }}.sagas.spec.ts',
        templateFile: path.join(templatesPath, '__tests__/sagas.spec.hbs'),
      },
      {
        type: 'add',
        path: 'src/shared/services/api/{{ camelCase name }}/index.ts',
        templateFile: path.join(templatesPath, 'api/index.hbs'),
      },
      {
        type: 'add',
        path: 'src/mocks/server/handlers/{{ camelCase name }}.ts',
        templateFile: path.join(templatesPath, 'api/mock.hbs'),
      },
      {
        type: 'add',
        path: 'src/shared/services/api/{{ camelCase name }}/types.ts',
        templateFile: path.join(templatesPath, 'api/types.hbs'),
      },
      {
        type: 'modify',
        path: 'src/config/reducers.ts',
        pattern: /(\/\/<-- IMPORT MODULE REDUCER -->)/g,
        template:
          "import { reducer as {{ camelCase name }}Reducer } from '../modules/{{ camelCase name }}/{{ camelCase name }}.reducer';\nimport { {{ pascalCase name }}State } from '../modules/{{ camelCase name }}/{{ camelCase name }}.types';\n$1",
      },
      {
        type: 'modify',
        path: 'src/config/reducers.ts',
        pattern: /(\/\/<-- INJECT MODULE REDUCER -->)/g,
        template: '{{ camelCase name }}: {{ camelCase name }}Reducer,\n    $1',
      },
      {
        type: 'modify',
        path: 'src/config/reducers.ts',
        pattern: /(\/\/<-- INJECT MODULE STATE TYPE -->)/g,
        template: '{{ camelCase name }}: {{ pascalCase name }}State;\n  $1',
      },
      {
        type: 'modify',
        path: 'src/config/sagas.ts',
        pattern: /(\/\/<-- IMPORT MODULE SAGA -->)/g,
        template:
          "import { watch{{ pascalCase name }} } from '../modules/{{ camelCase name }}/{{ camelCase name }}.sagas';\n$1",
      },
      {
        type: 'modify',
        path: 'src/config/sagas.ts',
        pattern: /(\/\/<-- INJECT MODULE SAGA -->)/g,
        template: 'fork(watch{{ pascalCase name }}),\n    $1',
      },
      {
        type: 'modify',
        path: 'src/mocks/store.ts',
        pattern: /(\/\/<-- IMPORT MODULE STATE -->)/g,
        template: "import { {{ constantCase name }}_INITIAL_STATE } from '../modules/{{ camelCase name }}';\n$1",
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
      {
        type: 'modify',
        path: 'src/mocks/store.ts',
        pattern: /(\/\/<-- INJECT MODULE STATE -->)/g,
        template: '{{ camelCase name }}: {{ constantCase name }}_INITIAL_STATE,\n  $1',
      },
    ],
  });
};
