const path = require('path');
const templatesPath = path.join(__dirname, '..', 'templates');

module.exports = [
  {
    type: 'add',
    path: 'src/shared/services/api/{{ camelCase name }}/auth.types.ts',
    templateFile: path.join(templatesPath, 'api/types.hbs'),
  },
  {
    type: 'add',
    path: 'src/mocks/factories/{{ camelCase name }}.ts',
    templateFile: path.join(templatesPath, 'factory.hbs'),
  },
  {
    type: 'modify',
    path: 'src/mocks/factories/index.ts',
    pattern: /(\/\/<-- INJECT FACTORY -->)/g,
    template: "export * from './{{ camelCase name }}';\n$1",
  },
  {
    type: 'modify',
    path: 'src/app/config/routes.ts',
    pattern: /(\/\/<-- INJECT ROUTE DEFINITION -->)/g,
    template: `{{ camelCase name }}: nestedPath('{{ dashCase name }}', {
    list: '',
    details: ':id',
    edit: ':id/edit',
    add: 'add',
  }),\n  $1`,
  },
  {
    type: 'modify',
    path: 'src/app/asyncComponents.ts',
    pattern: /(\/\/<-- IMPORT ROUTE -->)/g,
    template: `export const {{ pascalCase name }}List = asyncComponent(() => import('../routes/{{ camelCase name }}/{{ camelCase name }}List'));
export const {{ pascalCase name }}Details = asyncComponent(() => import('../routes/{{ camelCase name }}/{{ camelCase name }}Details'));
export const Add{{ pascalCase name }} = asyncComponent(() => import('../routes/{{ camelCase name }}/add{{ pascalCase name }}'));
export const Edit{{ pascalCase name }} = asyncComponent(() => import('../routes/{{ camelCase name }}/edit{{ pascalCase name }}'));\n$1`,
  },
  {
    type: 'modify',
    path: 'src/app/app.component.tsx',
    pattern: /(\/\/<-- IMPORT ROUTE COMPONENT -->)/g,
    template: `
  {{ pascalCase name }}List,
  {{ pascalCase name }}Details,
  Add{{ pascalCase name }},
  Edit{{ pascalCase name }}, //<-- IMPORT ROUTE COMPONENT -->`,
  },
  {
    type: 'modify',
    path: 'src/app/app.component.tsx',
    pattern: `{/* <-- INJECT ROUTE --> */}`,
    template: `
        <Route path={LANG_PREFIX} element={<AuthRoute />}>
          <Route path={RoutesConfig.{{ camelCase name }}.list} element={<{{ pascalCase name }}List />} />
          <Route path={RoutesConfig.{{ camelCase name }}.add} element={<Add{{ pascalCase name }} />} />
          <Route path={RoutesConfig.{{ camelCase name }}.details} element={<{{ pascalCase name }}Details />} />
          <Route path={RoutesConfig.{{ camelCase name }}.edit} element={<Edit{{ pascalCase name }} />} />
        </Route>
        {/* <-- INJECT ROUTE --> */}`,
  },
  {
    type: 'modify',
    path: 'src/app/app.component.tsx',
    pattern: /(\/\/<-- INJECT ROUTE IMPORT -->)/g,
    template: `{{ pascalCase name}}List,
  Add{{ pascalCase name}},
  {{ pascalCase name}}Details,
  Edit{{ pascalCase name}}, \n  $1`,
  },
];
