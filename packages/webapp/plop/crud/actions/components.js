const path = require('path');
const templatesPath = path.join(__dirname, '..', 'templates', 'components');

/**
 * Generate actions for CRUD components
 */
module.exports = (data) => {
  const basePath = data.basePath || 'src';
  const routeName = '{{ camelCase name }}';
  const routePath = `${basePath}/routes/${routeName}`;

  // Helper to create component actions
  const componentFiles = (componentName, templateName, subPath = '') => {
    const componentPath = subPath ? `${routePath}/${subPath}/${componentName}` : `${routePath}/${componentName}`;
    const templateDir = path.join(templatesPath, templateName);

    return [
      {
        type: 'add',
        path: `${componentPath}/index.tsx`,
        templateFile: path.join(templateDir, 'index.hbs'),
      },
      {
        type: 'add',
        path: `${componentPath}/${componentName}.component.tsx`,
        templateFile: path.join(templateDir, `${templateName}.component.hbs`),
      },
      {
        type: 'add',
        path: `${componentPath}/${componentName}.stories.tsx`,
        templateFile: path.join(templateDir, `${templateName}.stories.hbs`),
      },
      {
        type: 'add',
        path: `${componentPath}/__tests__/${componentName}.component.spec.tsx`,
        templateFile: path.join(templateDir, `__tests__/${templateName}.component.spec.hbs`),
      },
    ];
  };

  // Helper for GraphQL files
  const graphqlFile = (componentName, templateName, subPath = '') => {
    const componentPath = subPath ? `${routePath}/${subPath}/${componentName}` : `${routePath}/${componentName}`;
    const templateDir = path.join(templatesPath, templateName);

    return {
      type: 'add',
      path: `${componentPath}/${componentName}.graphql.ts`,
      templateFile: path.join(templateDir, `${templateName}.graphql.hbs`),
    };
  };

  return [
    // ========================
    // Root index file
    // ========================
    {
      type: 'add',
      path: `${routePath}/index.ts`,
      templateFile: path.join(templatesPath, 'rootIndex.hbs'),
    },

    // ========================
    // List component
    // ========================
    ...componentFiles('{{ camelCase name }}List', 'itemList'),

    // ========================
    // List Item component (nested in List)
    // ========================
    {
      type: 'add',
      path: `${routePath}/{{ camelCase name }}List/{{ camelCase name }}ListItem/index.tsx`,
      templateFile: path.join(templatesPath, 'itemList/itemListItem/index.hbs'),
    },
    {
      type: 'add',
      path: `${routePath}/{{ camelCase name }}List/{{ camelCase name }}ListItem/{{ camelCase name }}ListItem.component.tsx`,
      templateFile: path.join(templatesPath, 'itemList/itemListItem/itemListItem.component.hbs'),
    },
    {
      type: 'add',
      path: `${routePath}/{{ camelCase name }}List/{{ camelCase name }}ListItem/{{ camelCase name }}ListItem.graphql.ts`,
      templateFile: path.join(templatesPath, 'itemList/itemListItem/itemListItem.graphql.hbs'),
    },
    {
      type: 'add',
      path: `${routePath}/{{ camelCase name }}List/{{ camelCase name }}ListItem/{{ camelCase name }}ListItem.stories.tsx`,
      templateFile: path.join(templatesPath, 'itemList/itemListItem/itemListItem.stories.hbs'),
    },
    {
      type: 'add',
      path: `${routePath}/{{ camelCase name }}List/{{ camelCase name }}ListItem/__tests__/{{ camelCase name }}ListItem.component.spec.tsx`,
      templateFile: path.join(templatesPath, 'itemList/itemListItem/__tests__/itemListItem.component.spec.hbs'),
    },

    // ========================
    // Dropdown Menu (nested in List Item)
    // ========================
    {
      type: 'add',
      path: `${routePath}/{{ camelCase name }}List/{{ camelCase name }}ListItem/{{ camelCase name }}DropdownMenu/index.ts`,
      templateFile: path.join(templatesPath, 'itemList/itemListItem/itemDropdownMenu/index.hbs'),
    },
    {
      type: 'add',
      path: `${routePath}/{{ camelCase name }}List/{{ camelCase name }}ListItem/{{ camelCase name }}DropdownMenu/{{ camelCase name }}DropdownMenu.component.tsx`,
      templateFile: path.join(templatesPath, 'itemList/itemListItem/itemDropdownMenu/itemDropdownMenu.component.hbs'),
    },

    // ========================
    // List Skeleton
    // ========================
    {
      type: 'add',
      path: `${routePath}/{{ camelCase name }}List/listSkeleton/index.ts`,
      templateFile: path.join(templatesPath, 'itemList/listSkeleton/index.hbs'),
    },
    {
      type: 'add',
      path: `${routePath}/{{ camelCase name }}List/listSkeleton/listSkeleton.component.tsx`,
      templateFile: path.join(templatesPath, 'itemList/listSkeleton/listSkeleton.component.hbs'),
    },

    // ========================
    // Add Item component
    // ========================
    ...componentFiles('add{{ pascalCase name }}', 'addItem'),
    graphqlFile('add{{ pascalCase name }}', 'addItem'),

    // ========================
    // Edit Item component
    // ========================
    ...componentFiles('edit{{ pascalCase name }}', 'editItem'),
    graphqlFile('edit{{ pascalCase name }}', 'editItem'),

    // ========================
    // Item Details component
    // ========================
    ...componentFiles('{{ camelCase name }}Details', 'itemDetails'),
    graphqlFile('{{ camelCase name }}Details', 'itemDetails'),

    // ========================
    // Item Form component
    // ========================
    ...componentFiles('{{ camelCase name }}Form', 'itemForm'),
    {
      type: 'add',
      path: `${routePath}/{{ camelCase name }}Form/{{ camelCase name }}Form.hook.ts`,
      templateFile: path.join(templatesPath, 'itemForm/itemForm.hook.hbs'),
    },
  ];
};
