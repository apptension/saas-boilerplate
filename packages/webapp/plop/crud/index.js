const path = require('path');
const componentsActions = require('./actions/components');
const { getTemplateChoices, getTemplateFields, getFieldsSummary } = require('../lib/entityTemplates');

// Backend templates path for full-stack mode
const backendTemplatesPath = path.join(__dirname, '..', 'backend', 'templates');

module.exports = (plop) => {
  plop.setGenerator('crud', {
    description: 'Generate a full CRUD module with routes, forms, and GraphQL operations',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Entity name (e.g., "Product", "BlogPost"):',
        validate: plop.validators.required,
      },
      {
        type: 'input',
        name: 'pluralName',
        message: 'Plural entity name (leave empty for automatic):',
        default: (answers) => {
          const name = answers.name.toLowerCase();
          // Simple pluralization
          if (name.endsWith('y')) {
            return name.slice(0, -1) + 'ies';
          }
          if (name.endsWith('s') || name.endsWith('x') || name.endsWith('ch') || name.endsWith('sh')) {
            return name + 'es';
          }
          return name + 's';
        },
      },
      {
        type: 'list',
        name: 'template',
        message: 'Start from a template (defines fields):',
        choices: getTemplateChoices(),
        default: 'custom',
      },
      {
        type: 'list',
        name: 'mode',
        message: 'Generation mode:',
        choices: [
          { name: 'Frontend only - Create React components (requires existing backend)', value: 'frontend' },
          { name: 'Full-stack - Create both frontend and backend code', value: 'fullstack' },
        ],
        default: 'frontend',
      },
      {
        type: 'confirm',
        name: 'tenantDependent',
        message: 'Is this entity tenant-dependent (multi-tenancy)?',
        default: true,
        when: (answers) => answers.mode === 'fullstack',
      },
      {
        type: 'confirm',
        name: 'inWebappLibs',
        message: 'Create frontend in webapp-libs instead of webapp? (recommended for reusable modules)',
        default: false,
      },
      {
        type: 'input',
        name: 'libName',
        message: 'Library name (e.g., "webapp-products"):',
        when: (answers) => answers.inWebappLibs,
        validate: plop.validators.required,
      },
    ],
    actions: (data) => {
      // Get fields from template
      const fields = getTemplateFields(data.template);
      data.fields = fields;
      data.hasFields = fields.length > 0;
      data.fieldsSummary = getFieldsSummary(fields);

      // Set up paths based on location choice
      if (data.inWebappLibs) {
        data.basePath = `../webapp-libs/${data.libName}/src`;
        data.routesConfigImport = `../../../config/routes`;
      } else {
        data.basePath = 'src';
        data.routesConfigImport = `../../../app/config/routes`;
      }

      // Derive names for templates
      data.pluralCamelCase = data.pluralName.charAt(0).toLowerCase() + data.pluralName.slice(1);
      data.pluralPascalCase = data.pluralName.charAt(0).toUpperCase() + data.pluralName.slice(1);

      // Default tenantDependent if not set
      if (data.tenantDependent === undefined) {
        data.tenantDependent = true;
      }

      const actions = [
        ...componentsActions(data),
      ];

      // Add backend files if full-stack mode
      if (data.mode === 'fullstack') {
        const backendAppPath = `../../backend/apps/{{ snakeCase name }}`;

        actions.push(
          // __init__.py
          {
            type: 'add',
            path: `${backendAppPath}/__init__.py`,
            templateFile: path.join(backendTemplatesPath, 'init.hbs'),
          },
          // apps.py
          {
            type: 'add',
            path: `${backendAppPath}/apps.py`,
            templateFile: path.join(backendTemplatesPath, 'apps.hbs'),
          },
          // models.py
          {
            type: 'add',
            path: `${backendAppPath}/models.py`,
            templateFile: path.join(backendTemplatesPath, 'models.hbs'),
          },
          // serializers.py
          {
            type: 'add',
            path: `${backendAppPath}/serializers.py`,
            templateFile: path.join(backendTemplatesPath, 'serializers.hbs'),
          },
          // schema.py
          {
            type: 'add',
            path: `${backendAppPath}/schema.py`,
            templateFile: path.join(backendTemplatesPath, 'schema.hbs'),
          },
          // admin.py
          {
            type: 'add',
            path: `${backendAppPath}/admin.py`,
            templateFile: path.join(backendTemplatesPath, 'admin.hbs'),
          },
          // tests
          {
            type: 'add',
            path: `${backendAppPath}/tests/__init__.py`,
            templateFile: path.join(backendTemplatesPath, 'tests', 'init.hbs'),
          },
          {
            type: 'add',
            path: `${backendAppPath}/tests/factories.py`,
            templateFile: path.join(backendTemplatesPath, 'tests', 'factories.hbs'),
          },
          {
            type: 'add',
            path: `${backendAppPath}/tests/test_schema.py`,
            templateFile: path.join(backendTemplatesPath, 'tests', 'test_schema.hbs'),
          }
        );
      }

      // Success message
      const frontendPath = `${data.basePath}/routes/{{ camelCase name }}/`;
      const backendPath = data.mode === 'fullstack' ? `packages/backend/apps/{{ snakeCase name }}/` : '';

      actions.push({
        type: 'logSuccess',
        message: `
✅ CRUD module "{{ pascalCase name }}" created successfully!
${data.template !== 'custom' ? `\n📋 Template: ${data.template}\n   Fields:\n${data.fieldsSummary}` : ''}

📁 Frontend structure:
   ${frontendPath}
   ├── index.ts
   ├── {{ camelCase name }}List/
   │   ├── {{ camelCase name }}List.component.tsx
   │   ├── {{ camelCase name }}List.stories.tsx
   │   ├── {{ camelCase name }}ListItem/
   │   │   ├── {{ camelCase name }}ListItem.component.tsx
   │   │   ├── {{ camelCase name }}ListItem.graphql.ts
   │   │   └── {{ camelCase name }}DropdownMenu/
   │   └── listSkeleton/
   ├── add{{ pascalCase name }}/
   ├── edit{{ pascalCase name }}/
   ├── {{ camelCase name }}Details/
   └── {{ camelCase name }}Form/
${data.mode === 'fullstack' ? `
📁 Backend structure:
   ${backendPath}
   ├── __init__.py
   ├── apps.py
   ├── models.py
   ├── serializers.py
   ├── schema.py
   ├── admin.py
   └── tests/
       ├── __init__.py
       ├── factories.py
       └── test_schema.py
` : ''}
🔧 Next steps:
${data.mode === 'fullstack' ? `
   1. Add the app to INSTALLED_APPS in settings:
      
      'apps.{{ snakeCase name }}',

   2. Add schema to root schema in packages/backend/graphql_config.py:
      
      from apps.{{ snakeCase name }} import schema as {{ snakeCase name }}_schema
      
      # In Query class:
      class Query(
          ...,
          {{ snakeCase name }}_schema.Query,
          graphene.ObjectType,
      ):
          pass
      
      # In Mutation class:
      class Mutation(
          ...,
          {{ snakeCase name }}_schema.Mutation,
          graphene.ObjectType,
      ):
          pass

   3. Create and run migrations:
      
      pnpm saas backend makemigrations
      pnpm saas backend migrate

   4. Download schema and generate types:
      
      pnpm saas webapp graphql download-schema
      pnpm nx run webapp-api-client:graphql-codegen

   5. Add routes to your routes config

   6. Test your new CRUD feature!
` : `
   1. Create GraphQL schema on backend (or use 'pnpm plop crud' with full-stack mode)
   2. Add routes to your routes config
   3. Generate GraphQL types: pnpm nx run webapp-api-client:graphql-codegen
   4. Update mock factories for testing
`}`,
      });

      return actions;
    },
  });
};
