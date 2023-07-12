const path = require('path');
const templatesPath = path.join(__dirname, '..', 'templates', 'components');

const componentActions = (name, templatePath, routeName = `{{ camelCase name }}`) => [
  {
    type: 'add',
    path: `src/routes/${routeName}/${name}/__tests__/${name}.component.spec.tsx`,
    templateFile: path.join(templatesPath, `${templatePath}/__tests__/${templatePath}.component.spec.hbs`),
  },
  {
    type: 'add',
    path: `src/routes/${routeName}/${name}/${name}.component.tsx`,
    templateFile: path.join(templatesPath, `${templatePath}/${templatePath}.component.hbs`),
  },
  {
    type: 'add',
    path: `src/routes/${routeName}/${name}/${name}.stories.tsx`,
    templateFile: path.join(templatesPath, `${templatePath}/${templatePath}.stories.hbs`),
  },
  {
    type: 'add',
    path: `src/routes/${routeName}/${name}/index.tsx`,
    templateFile: path.join(templatesPath, `${templatePath}/index.hbs`),
  },
];

const graphqlActions = (name, templatePath, routeName = `{{ camelCase name }}`) => [
  {
    type: 'add',
    path: `src/routes/${routeName}/${name}/${name}.graphql.ts`,
    templateFile: path.join(templatesPath, `${templatePath}/${templatePath}.graphql.hbs`),
  },
];

module.exports = [
  {
    type: 'add',
    path: 'src/routes/{{ camelCase name }}/use{{ pascalCase name }}/index.tsx',
    templateFile: path.join(templatesPath, 'useItem/index.hbs'),
  },
  {
    type: 'add',
    path: 'src/routes/{{ camelCase name }}/use{{ pascalCase name }}/use{{ pascalCase name }}.hook.tsx',
    templateFile: path.join(templatesPath, 'useItem/useItem.hook.hbs'),
  },
  {
    type: 'add',
    path: 'src/routes/{{ camelCase name }}/use{{ pascalCase name }}/__tests__/use{{ pascalCase name }}.hook.spec.tsx',
    templateFile: path.join(templatesPath, 'useItem/__tests__/useItem.hook.spec.hbs'),
  },
  ...componentActions('edit{{ pascalCase name }}', 'editItem'),
  ...componentActions('{{ camelCase name }}Form', 'itemForm'),
  ...componentActions('{{ camelCase name }}Details', 'itemDetails'),
  ...componentActions('add{{ pascalCase name }}', 'addItem'),
  ...componentActions('{{ camelCase name }}List', 'itemList'),
  ...graphqlActions('add{{ pascalCase name }}', 'addItem'),
  ...graphqlActions('edit{{ pascalCase name }}', 'editItem'),
  ...graphqlActions('{{ camelCase name }}Details', 'itemDetails'),
  ...graphqlActions('{{ camelCase name }}List', 'itemList'),
  {
    type: 'add',
    path: `src/routes/{{ camelCase name }}/{{ camelCase name }}List/{{ camelCase name }}ListItem/__tests__/{{ camelCase name }}ListItem.component.spec.tsx`,
    templateFile: path.join(templatesPath, `itemList/itemListItem/__tests__/itemListItem.component.spec.hbs`),
  },
  {
    type: 'add',
    path: `src/routes/{{ camelCase name }}/{{ camelCase name }}List/{{ camelCase name }}ListItem/{{ camelCase name }}ListItem.component.tsx`,
    templateFile: path.join(templatesPath, `itemList/itemListItem/itemListItem.component.hbs`),
  },
  {
    type: 'add',
    path: `src/routes/{{ camelCase name }}/{{ camelCase name }}List/{{ camelCase name }}ListItem/{{ camelCase name }}ListItem.stories.tsx`,
    templateFile: path.join(templatesPath, `itemList/itemListItem/itemListItem.stories.hbs`),
  },
  {
    type: 'add',
    path: `src/routes/{{ camelCase name }}/{{ camelCase name }}List/{{ camelCase name }}ListItem/{{ camelCase name }}DropDownMenu/{{ camelCase name }}DropDownMenu.component.tsx`,
    templateFile: path.join(templatesPath, `itemList/itemListItem/itemDropDownMenu/itemDropDownMenu.hbs`),
  },
  {
    type: 'add',
    path: `src/routes/{{ camelCase name }}/{{ camelCase name }}List/{{ camelCase name }}ListItem/{{ camelCase name }}DropDownMenu/index.ts`,
    templateFile: path.join(templatesPath, `itemList/itemListItem/itemDropDownMenu/index.hbs`),
  },
  {
    type: 'add',
    path: `src/routes/{{ camelCase name }}/{{ camelCase name }}List/{{ camelCase name }}ListItem/index.tsx`,
    templateFile: path.join(templatesPath, `itemList/itemListItem/index.hbs`),
  },
  {
    type: 'add',
    path: `src/routes/{{ camelCase name }}/{{ camelCase name }}Form/{{ camelCase name }}Form.hook.ts`,
    templateFile: path.join(templatesPath, `itemForm/itemForm.hook.hbs`),
  },
  {
    type: 'add',
    path: `src/routes/{{ camelCase name }}/{{ camelCase name }}List/listSkeleton/listSkeleton.component.tsx`,
    templateFile: path.join(templatesPath, `itemList/listSkeleton/listSkeleton.component.hbs`),
  },
  {
    type: 'add',
    path: `src/routes/{{ camelCase name }}/{{ camelCase name }}List/listSkeleton/index.ts`,
    templateFile: path.join(templatesPath, `itemList/listSkeleton/index.hbs`),
  },
];
