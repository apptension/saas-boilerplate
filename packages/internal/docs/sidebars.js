module.exports = {
  mainSidebar: [
    {
      type: 'category',
      label: 'Documentation',
      link: {
        type: 'doc',
        id: 'index',
      },
      items: [
        {
          type: 'link',
          label: 'Getting started',
          href: '/getting-started',
          description: 'Setup and run the project locally',
        },
        {
          type: 'link',
          label: 'What is SaaS Boilerplate',
          href: '/introduction',
        },
        {
          type: 'link',
          label: 'Working with SaaS Boilerplate',
          href: '/working-with-sb',
        },
        {
          type: 'link',
          label: 'Amazon Web Services',
          href: '/aws',
        },
        {
          type: 'link',
          label: 'API Reference',
          href: '/api-reference',
        },
      ],
    },
  ],
  apiReferenceSidebar: [
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'api-reference/index',
      },
      items: [
        {
          type: 'category',
          label: 'back-end',
          collapsed: false,
          link: {
            type: 'doc',
            id: 'api-reference/backend/index',
          },
          items: [
            'api-reference/backend/commands',
            {
              type: 'category',
              label: 'Modules',
              items: [
                {
                  type: 'autogenerated',
                  dirName: 'api-reference/backend/generated',
                },
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'webapp',
          link: {
            type: 'doc',
            id: 'api-reference/webapp/index',
          },
          collapsed: false,
          items: [
            'api-reference/webapp/commands',
            {
              type: 'autogenerated',
              dirName: 'api-reference/webapp/generated',
            },
          ],
        },
        {
          type: 'category',
          label: 'webapp-core',
          collapsed: false,
          items: [
            {
              type: 'autogenerated',
              dirName: 'api-reference/webapp-core/generated',
            },
          ],
        },
        {
          type: 'category',
          label: 'webapp-api-client',
          collapsed: false,
          items: [
            {
              type: 'autogenerated',
              dirName: 'api-reference/webapp-api-client/generated',
            },
            'api-reference/webapp-api-client/commands',
          ],
        },
        {
          type: 'category',
          label: 'webapp-emails',
          link: {
            type: 'doc',
            id: 'api-reference/webapp-emails/index',
          },
          collapsed: false,
          items: ['api-reference/webapp-emails/commands'],
        },
        {
          type: 'category',
          label: 'tools',
          link: {
            type: 'doc',
            id: 'api-reference/tools/index',
          },
          collapsed: false,
          items: ['api-reference/tools/commands'],
        },
        'api-reference/env',
        'api-reference/env-files',
      ],
    },
  ],
  gettingStartedSidebar: [
    {
      type: 'category',
      label: 'Getting started',

      link: {
        type: 'doc',
        id: 'getting-started/index',
      },
      items: [
        'getting-started/run-project/run-new-project',
        'getting-started/run-project/run-existing-project',
      ],
    },
  ],
  awsSidebar: [
    {
      type: 'category',
      label: 'AWS',
      link: {
        type: 'doc',
        id: 'aws/index',
      },
      items: [
        {
          type: 'category',
          label: 'Deploy to AWS',
          link: {
            type: 'doc',
            id: 'aws/deploy-to-aws/index',
          },
          items: [
            'aws/deploy-to-aws/configure-aws-credentials',
            'aws/deploy-to-aws/configure-hosted-zone',
            'aws/deploy-to-aws/create-env-stage-in-repo',
            'aws/deploy-to-aws/deploy-infrastructure',
            'aws/deploy-to-aws/create-runtime-env-vars',
            'aws/deploy-to-aws/run-deployment-commands',
          ],
        },
        {
          type: 'category',
          label: 'Continuous integration',
          link: {
            type: 'doc',
            id: 'aws/cicd/index',
          },
          items: [
            'aws/cicd/trigger-cicd-manually',
            'aws/cicd/auto-deploy',
            'aws/cicd/configure-cicd-notifications',
            'aws/cicd/setup-docker-hub',
          ],
        },
        {
          type: 'category',
          label: 'Guides',
          link: {
            type: 'doc',
            id: 'aws/guides/index',
          },
          items: ['aws/guides/aws-exec'],
        },
        {
          type: 'category',
          label: 'Architecture',
          link: {
            type: 'doc',
            id: 'aws/architecture/index',
          },
          items: [
            'aws/architecture/system-architecture',
            'aws/architecture/cicd-architecture',
          ],
        },
      ],
    },
  ],
  introductionSidebar: [
    {
      type: 'category',
      label: 'What is SaaS Boilerplate?',

      link: {
        type: 'doc',
        id: 'introduction/index',
      },
      items: [
        'introduction/the-problem',
        'introduction/architecture',
        'introduction/stack-description',
        {
          type: 'category',
          label: 'Features',
          collapsed: false,
          link: {
            type: 'doc',
            id: 'introduction/features/index',
          },
          items: [
            'introduction/features/auth',
            'introduction/features/emails',
            'introduction/features/notifications',
            'introduction/features/openai',
            'introduction/features/payments',
            'introduction/features/iac',
            'introduction/features/cicd',
            'introduction/features/cms',
            'introduction/features/admin',
            'introduction/features/graphql',
            'introduction/features/assets',
            'introduction/features/workers',
            'introduction/features/crud',
            'introduction/features/dev-tools',
          ],
        },
        {
          type: 'category',
          label: 'Coding standards',
          collapsed: false,
          link: {
            type: 'doc',
            id: 'introduction/coding-standards/index',
          },
          items: [
            {
              type: 'category',
              label: 'Formatters',
              collapsed: false,
              link: {
                type: 'doc',
                id: 'introduction/coding-standards/formatters/index',
              },
              items: ['introduction/coding-standards/formatters/black'],
            },
            {
              type: 'category',
              label: 'Linters',
              collapsed: false,
              link: {
                type: 'doc',
                id: 'introduction/coding-standards/linters/index',
              },
              items: ['introduction/coding-standards/linters/ruff'],
            },
          ],
        },
      ],
    },
  ],
  workingWithSidebar: [
    {
      type: 'category',
      label: 'Working with SaaS Boilerplate',

      link: {
        type: 'generated-index',
        title: 'Working with SaaS Boilerplate',
        slug: '/working-with-sb',
      },
      items: [
        {
          type: 'category',
          label: 'Generic guides',
          link: {
            type: 'generated-index',
            title: 'Generic guides',
            slug: '/working-with-sb/guides',
          },
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'Web app',

              link: {
                type: 'generated-index',
                title: 'Web app generic guides',
                slug: '/working-with-sb/guides/web-app',
              },
              items: [
                {
                  type: 'doc',
                  id: 'working-with-sb/guides/web-app/create-react-component',
                  label: 'Add React component',
                },
                {
                  type: 'doc',
                  id: 'working-with-sb/guides/web-app/new-route',
                  label: 'Add route component',
                },
              ],
            },
            {
              type: 'category',
              label: 'Back-end',

              link: {
                type: 'generated-index',
                title: 'Back-end generic guides',
                slug: '/working-with-sb/guides/backend',
              },
              items: [
                {
                  type: 'doc',
                  id: 'working-with-sb/guides/backend/backend-model',
                  label: 'Create new model',
                },
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Project structure',

          link: {
            type: 'generated-index',
            title: 'Project structure',
            slug: '/working-with-sb/project-structure',
          },
          items: ['working-with-sb/project-structure/create-web-lib'],
        },
        {
          type: 'category',
          label: 'Working with GraphQL',
          link: {
            type: 'generated-index',
            title: 'Working with GraphQL',
            slug: '/working-with-sb/graphql',
          },
          items: [
            {
              type: 'category',
              label: 'Conventions',

              link: {
                type: 'generated-index',
                title: 'Conventions',
                slug: '/working-with-sb/graphql/conventions',
              },
              items: ['working-with-sb/graphql/conventions/errors-format'],
            },
            {
              type: 'category',
              label: 'Web app',

              link: {
                type: 'generated-index',
                title: 'Web app',
                slug: '/working-with-sb/graphql/web-app',
              },
              items: [
                {
                  type: 'doc',
                  id: 'working-with-sb/graphql/web-app/component-with-query',
                  label: 'Fetch data from back-end',
                },
                {
                  type: 'doc',
                  id: 'working-with-sb/graphql/web-app/form-with-mutation',
                  label: 'Form component with mutation',
                },
                'working-with-sb/graphql/web-app/update-schema',
                'working-with-sb/graphql/web-app/use-fragments',
              ],
            },
            {
              type: 'category',
              label: 'Backend',

              link: {
                type: 'generated-index',
                title: 'Web app',
                slug: '/working-with-sb/graphql/backend',
              },
              items: [
                {
                  type: 'doc',
                  id: 'working-with-sb/graphql/backend/adding-new-mutation',
                  label: 'Add a new mutation',
                },
                {
                  type: 'doc',
                  id: 'working-with-sb/graphql/backend/working-with-serializers',
                  label: 'Working with serializers',
                },
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'In-app notification module',
          link: {
            type: 'doc',
            id: 'working-with-sb/notifications/index',
          },
          items: ['working-with-sb/notifications/create-notification'],
        },
        {
          type: 'category',
          label: 'User module / Authentication and authorization',
          link: {
            type: 'doc',
            id: 'working-with-sb/users/index',
          },
          items: [
            'working-with-sb/users/create-profile-field',
            'working-with-sb/users/create-oauth-method',
            'working-with-sb/users/admin-page',
            'working-with-sb/users/create-role',
          ],
        },
        {
          type: 'category',
          label: 'Payments (Stripe integration)',
          collapsed: false,
          link: {
            type: 'doc',
            id: 'working-with-sb/payments/index',
          },
          items: ['working-with-sb/payments/one-time-payment-form'],
        },
        {
          type: 'category',
          label: 'Contentful',

          link: {
            type: 'generated-index',
            title: 'Contentful',
            slug: '/working-with-sb/contentful',
          },
          items: ['working-with-sb/contentful/sync-data'],
        },
        {
          type: 'category',
          label: 'Writing tests',

          link: {
            type: 'generated-index',
            title: 'Writing tests',
            slug: '/working-with-sb/tests',
          },
          items: [
            'working-with-sb/tests/webapp',
            'working-with-sb/tests/backend',
          ],
        },
        {
          type: 'category',
          label: 'Emails',

          link: {
            type: 'generated-index',
            title: 'Emails',
            slug: '/working-with-sb/emails',
          },
          items: [
            'working-with-sb/emails/create-email-template',
            'working-with-sb/emails/send-email',
          ],
        },
        {
          type: 'category',
          label: 'Async workers',
          link: {
            type: 'generated-index',
            title: 'Async workers',
            slug: '/working-with-sb/async-workers',
          },
          items: [
            'working-with-sb/async-workers/run-async-job',
            'working-with-sb/async-workers/create-workers-module',
          ],
        },
        {
          type: 'category',
          label: 'Devtools',

          link: {
            type: 'generated-index',
            title: 'Devtools',
            slug: '/working-with-sb/dev-tools',
          },
          items: [
            'working-with-sb/dev-tools/version-matrix',
            'working-with-sb/dev-tools/mailcatcher',
            'working-with-sb/dev-tools/sentry',
            'working-with-sb/dev-tools/ssh-into-container',
            'working-with-sb/dev-tools/plop',
          ],
        },
      ],
    },
  ],
};
