module.exports = {
  mainSidebar: [
    {
      type: 'category',
      label: 'Documentation',

      link: {
        type: 'generated-index',
        title: 'SaaS Boilerplate by Apptension Docs',
        description: 'SaaS Boilerplate by Apptension Docs',
        slug: '/',
      },
      items: [
        {
          type: 'link',
          label: 'Getting started',
          href: '/getting-started',
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
        type: 'generated-index',
        title: 'Getting started',
        description: 'TODO: >Getting started description<',
        slug: '/getting-started',
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
