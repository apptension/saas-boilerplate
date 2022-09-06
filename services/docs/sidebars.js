module.exports = {
  someSidebar: {
    Introduction: [
      "intro/index",
      "intro/architecture",
      "intro/cicd-architecture",
    ],
    "Setup AWS Infrastructure": [
      "setup-aws/infrastructure-components",
      "setup-aws/initial-setup",
      "setup-aws/environment-stage",
      "setup-aws/auto-deploy",
    ],
    Guides: [
      "guides/aws-exec",
      "guides/git-flow",
      "guides/aws-manual-deploy",
      "guides/configure-cicd-slack-notifications",
    ],
    Features: [
      "features/sentry",
      "features/emails",
      "features/notifications",
      {
        type: "category",
        label: "Payments",
        items: [
          "features/payments/stripe-intro",
          {
            type: "category",
            label: "One time payment",
            items: [
              "features/payments/one-time/create-payment-intent",
              "features/payments/one-time/complete-payment",
            ],
          },
          {
            type: "category",
            label: "Subscriptions",
            items: [
              "features/payments/subscriptions/intro",
              "features/payments/subscriptions/create-plan",
              "features/payments/subscriptions/free-trial",
              "features/payments/subscriptions/grace-period",
            ],
          },
          "features/payments/stripe-webhooks",
        ],
      },
      "features/assets-management",
      "features/crud-generator",
      "features/django-rest-api",
      {
        type: "category",
        label: "SSO",
        items: [
          "features/sso/general",
          "features/sso/facebook",
          "features/sso/google",
        ],
      },
      {
        type: "category",
        label: "CMS",
        items: [
          "features/cms/contentful-migrations",
          "features/cms/contentful-webapp",
          "features/cms/contentful-backend",
        ],
      },
      {
        type: "category",
        label: "GraphQL",
        items: ["features/graphql/subscriptions", "features/graphql/relay"],
      },
      {
        type: "category",
        label: "Async Workers",
        items: ["features/async-workers/delete-state-machine"],
      },
      {
        type: "category",
        label: "Dev tools",
        items: [
          "features/dev-tools/global-tools",
          "features/dev-tools/version-matrix",
          "features/dev-tools/mailcatcher",
        ],
      },
      "features/xray",
    ],
    Docusaurus: ["docusaurus/style-guide", "docusaurus/example"],
  },
};
