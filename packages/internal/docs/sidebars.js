module.exports = {
  mainSidebar: [
    {
      type: 'category',
      label: 'Documentation',

      link: {
        type: 'doc',
        id: 'v2/index',
      },
      items: [
        {
          type: 'link',
          label: 'Getting started',
          href: '/v2/getting-started',
          description: 'Setup and run the project locally',
        },
        {
          type: 'link',
          label: 'Tutorials',
          href: '/tutorials',
        },
        {
          type: 'link',
          label: 'Working with SaaS Boilerplate by Apptension',
          href: '/working-with-sb',
        },
        {
          type: 'link',
          label: 'What is SaaS Boilerplate by Apptension',
          href: '/introduction',
        },
        'v2/api-reference',
        {
          type: 'link',
          label: 'Old docs (v1)',
          href: '/v1',
        },
      ],
    },
  ],
  gettingStartedSidebar: [
    {
      type: 'category',
      label: 'Getting started',

      link: {
        type: 'doc',
        id: 'v2/getting-started/index',
      },
      items: [
        'v2/getting-started/run-project/run-new-project',
        'v2/getting-started/run-project/run-existing-project',
        {
          type: 'link',
          label: 'Tutorials',
          href: '/tutorials',
        },
      ],
    },
  ],
  tutorialsSidebar: [
    {
      type: 'category',
      label: 'Tutorials',

      link: {
        type: 'generated-index',
        title: 'Tutorials',
        description: 'TODO: >Tutorials description<',
        slug: '/tutorials',
      },
      items: [
        'v2/tutorials/deploy-to-aws',
        'v2/tutorials/crud',
        'v2/tutorials/deploy-to-production',
      ],
    },
  ],
  introductionSidebar: [
    {
      type: 'category',
      label: 'What is SaaS Boilerplate by Apptension?',

      link: {
        type: 'generated-index',
        title: 'What is SaaS Boilerplate by Apptension?',
        description:
          'TODO: >What is SaaS Boilerplate by Apptension? description<',
        slug: '/introduction',
      },
      items: [
        'v2/introduction/the-problem',
        'v2/introduction/architecture',
        'v2/introduction/stack-description',
        'v2/introduction/features',
        'v2/introduction/development',
      ],
    },
  ],
  workingWithSidebar: [
    {
      type: 'category',
      label: 'Working with SaaS Boilerplate by Apptension',

      link: {
        type: 'generated-index',
        title: 'Working with SaaS Boilerplate by Apptension',
        description: 'TODO: >description<',
        slug: '/working-with-sb',
      },
      items: [
        {
          type: 'category',
          label: 'Generic guides',

          link: {
            type: 'generated-index',
            title: 'Generic guides',
            description: 'TODO: >description<',
            slug: '/working-with-sb/guides',
          },
          items: [
            'v2/working-with-sb/guides/create-react-component',
            'v2/working-with-sb/guides/form-with-mutation',
            'v2/working-with-sb/guides/real-time-data',
            'v2/working-with-sb/guides/new-route',
            'v2/working-with-sb/guides/another-graphql-api',
            'v2/working-with-sb/guides/backend-model',
            'v2/working-with-sb/guides/component-with-query',
          ],
        },
        {
          type: 'category',
          label: 'Project structure',

          link: {
            type: 'generated-index',
            title: 'Project structure',
            description: 'TODO: >description<',
            slug: '/working-with-sb/project-structure',
          },
          items: [
            'v2/working-with-sb/project-structure/create-web-lib',
            'v2/working-with-sb/project-structure/remove-web-lib',
            'v2/working-with-sb/project-structure/env-files',
            'v2/working-with-sb/project-structure/create-nx-command',
          ],
        },
        {
          type: 'category',
          label: 'Working with GraphQL',

          link: {
            type: 'generated-index',
            title: 'Working with GraphQL',
            description: 'TODO: >description<',
            slug: '/working-with-sb/graphql',
          },
          items: [
            {
              type: 'category',
              label: 'Conventions',

              link: {
                type: 'generated-index',
                title: 'Conventions',
                description: 'TODO: >description<',
                slug: '/working-with-sb/graphql/conventions',
              },
              items: [
                'v2/working-with-sb/graphql/conventions/nodes-connections',
                'v2/working-with-sb/graphql/conventions/paging',
                'v2/working-with-sb/graphql/conventions/errors-format',
              ],
            },
            {
              type: 'category',
              label: 'Web app',

              link: {
                type: 'generated-index',
                title: 'Web app',
                description: 'TODO: >description<',
                slug: '/working-with-sb/graphql/web-app',
              },
              items: [
                'v2/working-with-sb/graphql/web-app/update-schema',
                'v2/working-with-sb/graphql/web-app/use-fragments',
                'v2/working-with-sb/graphql/web-app/naming-conventions',
                'v2/working-with-sb/graphql/web-app/use-api-form',
                'v2/working-with-sb/graphql/web-app/subscriptions',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'In-app notification module',

          link: {
            type: 'generated-index',
            title: 'In-app notification module',
            description: 'TODO: >description<',
            slug: '/working-with-sb/notifications',
          },
          items: ['v2/working-with-sb/notifications/create-notification'],
        },
        {
          type: 'category',
          label: 'Assets management',

          link: {
            type: 'generated-index',
            title: 'Assets management',
            description: 'TODO: >description<',
            slug: '/working-with-sb/asset-management',
          },
          items: [
            'v2/working-with-sb/asset-management/file-upload',
            'v2/working-with-sb/asset-management/create-signed-url',
          ],
        },
        {
          type: 'category',
          label: 'User module / Authentication and authorization',

          link: {
            type: 'generated-index',
            title: 'User module / Authentication and authorization',
            description: 'TODO: >description<',
            slug: '/working-with-sb/users',
          },
          items: [
            'v2/working-with-sb/users/create-profile-field',
            'v2/working-with-sb/users/create-oauth-method',
            'v2/working-with-sb/users/admin-page',
            'v2/working-with-sb/users/create-role',
          ],
        },
        {
          type: 'category',
          label: 'Payments (Stripe integration)',

          link: {
            type: 'generated-index',
            title: 'Payments (Stripe integration)',
            description: 'TODO: >description<',
            slug: '/working-with-sb/payments',
          },
          items: [
            'v2/working-with-sb/payments/one-time-payment-form',
            'v2/working-with-sb/payments/subscription-access',
            'v2/working-with-sb/payments/create-subscription-plan',
          ],
        },
        {
          type: 'category',
          label: 'Contentful',

          link: {
            type: 'generated-index',
            title: 'Contentful',
            description: 'TODO: >description<',
            slug: '/working-with-sb/contentful',
          },
          items: [
            'v2/working-with-sb/contentful/demo-item-model',
            'v2/working-with-sb/contentful/sync-data',
          ],
        },
        {
          type: 'category',
          label: 'Writing tests',

          link: {
            type: 'generated-index',
            title: 'Writing tests',
            description: 'TODO: >description<',
            slug: '/working-with-sb/tests',
          },
          items: [
            'v2/working-with-sb/tests/webapp',
            'v2/working-with-sb/tests/backend',
            'v2/working-with-sb/tests/e2e',
          ],
        },
        {
          type: 'category',
          label: 'Infrastructure',

          link: {
            type: 'generated-index',
            title: 'Infrastructure',
            description: 'TODO: >description<',
            slug: '/working-with-sb/infrastructure',
          },
          items: [
            'v2/working-with-sb/infrastructure/initial-setup',
            'v2/working-with-sb/infrastructure/create-environment',
            'v2/working-with-sb/infrastructure/env-variables',
          ],
        },
        {
          type: 'category',
          label: 'Emails',

          link: {
            type: 'generated-index',
            title: 'Emails',
            description: 'TODO: >description<',
            slug: '/working-with-sb/emails',
          },
          items: [
            'v2/working-with-sb/emails/build-emails',
            'v2/working-with-sb/emails/create-email-template',
            'v2/working-with-sb/emails/send-email',
          ],
        },
        {
          type: 'category',
          label: 'Async workers',

          link: {
            type: 'generated-index',
            title: 'Async workers',
            description: 'TODO: >description<',
            slug: '/working-with-sb/async-workers',
          },
          items: [
            'v2/working-with-sb/async-workers/run-async-job',
            'v2/working-with-sb/async-workers/create-sls-package',
          ],
        },
        {
          type: 'category',
          label: 'Devtools',

          link: {
            type: 'generated-index',
            title: 'Devtools',
            description: 'TODO: >description<',
            slug: '/working-with-sb/dev-tools',
          },
          items: [
            'v2/working-with-sb/dev-tools/version-matrix',
            'v2/working-with-sb/dev-tools/mailcatcher',
            'v2/working-with-sb/dev-tools/sentry',
            'v2/working-with-sb/dev-tools/ssh-into-container',
            'v2/working-with-sb/dev-tools/configure-cicd-notifications',
          ],
        },
        {
          type: 'category',
          label: 'Configure IDE and editors',

          link: {
            type: 'generated-index',
            title: 'Configure IDE and editors',
            description: 'TODO: >description<',
            slug: '/working-with-sb/ide-editors',
          },
          items: [
            'v2/working-with-sb/ide-editors/configure-pycharm',
            'v2/working-with-sb/ide-editors/configure-vscode',
          ],
        },
      ],
    },
  ],
  v1Sidebar: [
    {
      type: 'category',
      label: 'Old docs - to (re)move',

      link: {
        type: 'generated-index',
        title: 'Getting started',
        description: 'Old docs',
        slug: '/v1/',
      },
      items: [
        {
          type: 'category',
          label: 'Getting started',

          link: {
            type: 'generated-index',
            title: 'Getting started',
            description:
              'Learn about the most important SaaS Boilerplate by Apptension concepts!',
            slug: '/v1/index',
          },
          items: [
            'v1/getting-started/fresh-project-setup',
            'v1/getting-started/launch-existing-project',
          ],
        },
        {
          type: 'category',
          label: 'Architecture',
          items: ['v1/intro/architecture', 'v1/intro/cicd-architecture'],
        },
        {
          type: 'category',
          label: 'Setup AWS Infrastructure',
          items: [
            'v1/setup-aws/infrastructure-components',
            'v1/setup-aws/initial-setup',
            'v1/setup-aws/environment-stage',
            'v1/setup-aws/auto-deploy',
          ],
        },
        {
          type: 'category',
          label: 'Guides',
          items: [
            'v1/guides/aws-exec',
            'v1/guides/git-flow',
            'v1/guides/aws-manual-deploy',
            'v1/guides/configure-cicd-slack-notifications',
            'v1/guides/sonar-cloud-integration',
          ],
        },
        {
          type: 'category',
          label: 'Features',
          items: [
            'v1/features/sentry',
            'v1/features/emails',
            'v1/features/notifications',
            {
              type: 'category',
              label: 'Payments',
              items: [
                'v1/features/payments/stripe-intro',
                {
                  type: 'category',
                  label: 'One time payment',
                  items: [
                    'v1/features/payments/one-time/create-payment-intent',
                    'v1/features/payments/one-time/complete-payment',
                  ],
                },
                {
                  type: 'category',
                  label: 'Subscriptions',
                  items: [
                    'v1/features/payments/subscriptions/intro',
                    'v1/features/payments/subscriptions/create-plan',
                    'v1/features/payments/subscriptions/free-trial',
                    'v1/features/payments/subscriptions/grace-period',
                  ],
                },
                'v1/features/payments/stripe-webhooks',
              ],
            },
            'v1/features/assets-management',
            'v1/features/crud-generator',
            'v1/features/django-rest-api',
            {
              type: 'category',
              label: 'SSO',
              items: [
                'v1/features/sso/general',
                'v1/features/sso/facebook',
                'v1/features/sso/google',
              ],
            },
            {
              type: 'category',
              label: 'CMS',
              items: [
                'v1/features/cms/contentful-migrations',
                'v1/features/cms/contentful-webapp',
                'v1/features/cms/contentful-backend',
              ],
            },
            {
              type: 'category',
              label: 'GraphQL',
              items: [
                'v1/features/graphql/subscriptions',
                'v1/features/graphql/relay',
              ],
            },
            {
              type: 'category',
              label: 'Async Workers',
              items: ['v1/features/async-workers/delete-state-machine'],
            },
            {
              type: 'category',
              label: 'Dev tools',
              items: [
                'v1/features/dev-tools/global-tools',
                'v1/features/dev-tools/status-dashboard',
                'v1/features/dev-tools/mailcatcher',
              ],
            },
            'v1/features/xray',
          ],
        },
        {
          type: 'category',
          label: 'Docusaurus',
          items: ['v1/docusaurus/style-guide', 'v1/docusaurus/example'],
        },
      ],
    },
  ],
};
