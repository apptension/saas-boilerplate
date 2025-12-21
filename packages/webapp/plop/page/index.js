const path = require('path');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  const pageDirectory = 'src/routes/{{ camelCase name }}';

  plop.setGenerator('page', {
    description: 'Generate a page/route with navigation',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Page name (e.g., "Dashboard", "Settings", "Analytics"):',
        validate: plop.validators.required,
      },
      {
        type: 'input',
        name: 'routePath',
        message: 'Route path (e.g., "/dashboard", "/settings"):',
        default: (answers) => `/${answers.name.toLowerCase().replace(/\s+/g, '-')}`,
      },
      {
        type: 'input',
        name: 'pageTitle',
        message: 'Page title (for browser tab):',
        default: (answers) => answers.name,
      },
      {
        type: 'input',
        name: 'pageDescription',
        message: 'Page description (subtitle):',
        default: (answers) => `Manage your ${answers.name.toLowerCase()}`,
      },
      {
        type: 'list',
        name: 'pageIcon',
        message: 'Page icon (from Lucide):',
        choices: [
          { name: 'Layout Dashboard', value: 'LayoutDashboard' },
          { name: 'Settings', value: 'Settings' },
          { name: 'Bar Chart', value: 'BarChart3' },
          { name: 'Users', value: 'Users' },
          { name: 'File Text', value: 'FileText' },
          { name: 'Database', value: 'Database' },
          { name: 'Folder', value: 'Folder' },
          { name: 'Calendar', value: 'Calendar' },
          { name: 'Mail', value: 'Mail' },
          { name: 'Bell', value: 'Bell' },
          { name: 'Home', value: 'Home' },
          { name: 'Star', value: 'Star' },
        ],
        default: 'LayoutDashboard',
      },
      {
        type: 'confirm',
        name: 'requiresAuth',
        message: 'Requires authentication?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withSkeleton',
        message: 'Include loading skeleton?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withDataFetching',
        message: 'Include data fetching (GraphQL query)?',
        default: false,
      },
    ],
    actions: (data) => {
      const actions = [
        // Index file
        {
          type: 'add',
          path: `${pageDirectory}/index.tsx`,
          templateFile: path.join(templatesPath, 'index.hbs'),
        },
        // Page component
        {
          type: 'add',
          path: `${pageDirectory}/{{ camelCase name }}.component.tsx`,
          templateFile: path.join(templatesPath, 'page.component.hbs'),
        },
        // Stories
        {
          type: 'add',
          path: `${pageDirectory}/{{ camelCase name }}.stories.tsx`,
          templateFile: path.join(templatesPath, 'page.stories.hbs'),
        },
        // Test
        {
          type: 'add',
          path: `${pageDirectory}/__tests__/{{ camelCase name }}.component.spec.tsx`,
          templateFile: path.join(templatesPath, '__tests__/page.component.spec.hbs'),
        },
      ];

      // Optional skeleton
      if (data.withSkeleton) {
        actions.push({
          type: 'add',
          path: `${pageDirectory}/{{ camelCase name }}Skeleton.component.tsx`,
          templateFile: path.join(templatesPath, 'skeleton.component.hbs'),
        });
      }

      // Optional GraphQL
      if (data.withDataFetching) {
        actions.push({
          type: 'add',
          path: `${pageDirectory}/{{ camelCase name }}.graphql.ts`,
          templateFile: path.join(templatesPath, 'page.graphql.hbs'),
        });
      }

      // Success message
      actions.push({
        type: 'logSuccess',
        message: `
✅ Page "{{ pascalCase name }}" created successfully!

📁 Created files:
   - ${pageDirectory}/index.tsx
   - ${pageDirectory}/{{ camelCase name }}.component.tsx
   - ${pageDirectory}/{{ camelCase name }}.stories.tsx
   - ${pageDirectory}/__tests__/{{ camelCase name }}.component.spec.tsx${data.withSkeleton ? `\n   - ${pageDirectory}/{{ camelCase name }}Skeleton.component.tsx` : ''}${data.withDataFetching ? `\n   - ${pageDirectory}/{{ camelCase name }}.graphql.ts` : ''}

🔧 Next steps:
   1. Add route to your routes config:
      
      {{ camelCase name }}: '{{ routePath }}',

   2. Add route to your app router:
      
      <Route path={RoutesConfig.{{ camelCase name }}} element={<{{ pascalCase name }} />} />

   3. ${data.withDataFetching ? 'Run GraphQL codegen: pnpm nx run webapp-api-client:graphql-codegen' : 'Customize the page content'}
`,
      });

      return actions;
    },
  });
};
