const path = require('path');
const { getTemplateChoices, getTemplateFields, getFieldsSummary } = require('../lib/entityTemplates');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  // Backend apps are created in packages/backend/apps/
  const appDirectory = '../../backend/apps/{{ snakeCase name }}';

  plop.setGenerator('backend', {
    description: 'Generate a Django app with model and GraphQL schema',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'App/model name (e.g., "Product", "BlogPost", "Order"):',
        validate: plop.validators.required,
      },
      {
        type: 'input',
        name: 'pluralName',
        message: 'Plural name (leave empty for automatic):',
        default: (answers) => {
          const name = answers.name.toLowerCase();
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
        message: 'Start from a template:',
        choices: getTemplateChoices(),
        default: 'custom',
      },
      {
        type: 'confirm',
        name: 'tenantDependent',
        message: 'Is this model tenant-dependent (multi-tenancy)?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withAdmin',
        message: 'Register in Django admin?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withTests',
        message: 'Generate test files?',
        default: true,
      },
    ],
    actions: (data) => {
      // Get fields from template
      const fields = getTemplateFields(data.template);
      data.fields = fields;
      data.hasFields = fields.length > 0;
      data.fieldsSummary = getFieldsSummary(fields);

      const actions = [
        // __init__.py
        {
          type: 'add',
          path: `${appDirectory}/__init__.py`,
          templateFile: path.join(templatesPath, 'init.hbs'),
        },
        // apps.py
        {
          type: 'add',
          path: `${appDirectory}/apps.py`,
          templateFile: path.join(templatesPath, 'apps.hbs'),
        },
        // models.py
        {
          type: 'add',
          path: `${appDirectory}/models.py`,
          templateFile: path.join(templatesPath, 'models.hbs'),
        },
        // serializers.py
        {
          type: 'add',
          path: `${appDirectory}/serializers.py`,
          templateFile: path.join(templatesPath, 'serializers.hbs'),
        },
        // schema.py
        {
          type: 'add',
          path: `${appDirectory}/schema.py`,
          templateFile: path.join(templatesPath, 'schema.hbs'),
        },
      ];

      // Optional admin
      if (data.withAdmin) {
        actions.push({
          type: 'add',
          path: `${appDirectory}/admin.py`,
          templateFile: path.join(templatesPath, 'admin.hbs'),
        });
      }

      // Optional tests
      if (data.withTests) {
        actions.push(
          {
            type: 'add',
            path: `${appDirectory}/tests/__init__.py`,
            templateFile: path.join(templatesPath, 'tests/init.hbs'),
          },
          {
            type: 'add',
            path: `${appDirectory}/tests/factories.py`,
            templateFile: path.join(templatesPath, 'tests/factories.hbs'),
          },
          {
            type: 'add',
            path: `${appDirectory}/tests/test_schema.py`,
            templateFile: path.join(templatesPath, 'tests/test_schema.hbs'),
          }
        );
      }

      // Success message
      actions.push({
        type: 'logSuccess',
        message: `
✅ Backend app "{{ snakeCase name }}" created successfully!

📁 Created files:
   packages/backend/apps/{{ snakeCase name }}/
   ├── __init__.py
   ├── apps.py
   ├── models.py
   ├── serializers.py
   ├── schema.py${data.withAdmin ? '\n   ├── admin.py' : ''}${data.withTests ? '\n   └── tests/\n       ├── __init__.py\n       ├── factories.py\n       └── test_schema.py' : ''}

🔧 Next steps:

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
      
      # In Mutation class (if applicable):
      class Mutation(
          ...,
          {{ snakeCase name }}_schema.Mutation,
          graphene.ObjectType,
      ):
          pass

   3. Create and run migrations:
      
      pnpm saas backend makemigrations
      pnpm saas backend migrate

   4. Download the updated GraphQL schema:
      
      pnpm saas webapp graphql download-schema
      pnpm nx run webapp-api-client:graphql-codegen
`,
      });

      return actions;
    },
  });
};
