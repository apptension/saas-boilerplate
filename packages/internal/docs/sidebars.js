module.exports = {
  doc: [
    {
      type: 'category',
      label: 'Getting started',

      link: {
        type: 'generated-index',
        title: 'Getting started',
        description:
          'Learn about the most important SaaS Boilerplate concepts!',
        slug: '/',
      },
      items: ['getting-started/fresh-project-setup', 'getting-started/launch-existing-project'],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: ['intro/architecture', 'intro/cicd-architecture'],
    },
    {
      type: 'category',
      label: 'Setup AWS Infrastructure',
      items: [
        'setup-aws/infrastructure-components',
        'setup-aws/initial-setup',
        'setup-aws/environment-stage',
        'setup-aws/auto-deploy',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/aws-exec',
        'guides/git-flow',
        'guides/aws-manual-deploy',
        'guides/configure-cicd-slack-notifications',
        'guides/sonar-cloud-integration',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/sentry',
        'features/emails',
        'features/notifications',
        {
          type: 'category',
          label: 'Payments',
          items: [
            'features/payments/stripe-intro',
            {
              type: 'category',
              label: 'One time payment',
              items: [
                'features/payments/one-time/create-payment-intent',
                'features/payments/one-time/complete-payment',
              ],
            },
            {
              type: 'category',
              label: 'Subscriptions',
              items: [
                'features/payments/subscriptions/intro',
                'features/payments/subscriptions/create-plan',
                'features/payments/subscriptions/free-trial',
                'features/payments/subscriptions/grace-period',
              ],
            },
            'features/payments/stripe-webhooks',
          ],
        },
        'features/assets-management',
        'features/crud-generator',
        'features/django-rest-api',
        {
          type: 'category',
          label: 'SSO',
          items: [
            'features/sso/general',
            'features/sso/facebook',
            'features/sso/google',
          ],
        },
        {
          type: 'category',
          label: 'CMS',
          items: [
            'features/cms/contentful-migrations',
            'features/cms/contentful-webapp',
            'features/cms/contentful-backend',
          ],
        },
        {
          type: 'category',
          label: 'GraphQL',
          items: ['features/graphql/subscriptions', 'features/graphql/relay'],
        },
        {
          type: 'category',
          label: 'Async Workers',
          items: ['features/async-workers/delete-state-machine'],
        },
        {
          type: 'category',
          label: 'Dev tools',
          items: [
            'features/dev-tools/global-tools',
            'features/dev-tools/status-dashboard',
            'features/dev-tools/mailcatcher',
          ],
        },
        'features/xray',
      ],
    },
    {
      type: 'category',
      label: 'Docusaurus',
      items: ['docusaurus/style-guide', 'docusaurus/example'],
    },
  ],
};
