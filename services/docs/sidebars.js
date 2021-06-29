module.exports = {
  someSidebar: {
    Introduction: ["index", "aws-setup", "aws-deployment", "aws-auto-deploy"],
    Guides: [
      "guides/aws-environment",
      "guides/ssh-bastion",
      "guides/configure-cicd-slack-notifications",
    ],
    Features: [
      "sentry",
      "emails",
      "notifications",
      {
        type: "category",
        label: "Payments",
        items: [
          "stripe-payments-intro",
          {
            type: "category",
            label: "One time payment",
            items: [
              "stripe-onetime-payment-create-intent",
              "stripe-onetime-payment-complete",
            ],
          },
          {
            type: "category",
            label: "Subscriptions",
            items: [
              "subscriptions-intro",
              "subscriptions-create-plan",
              "subscriptions-free-trial",
              "subscriptions-grace-period",
            ],
          },
          "stripe-webhooks",
        ],
      },

      "crud-generator",
      "django-rest-api",
      {
        type: "category",
        label: "SSO",
        items: ["sso-general", "sso-facebook", "sso-google"],
      },
      {
        type: "category",
        label: "CMS",
        items: [
          "cms-contentful-migrations",
          "cms-contentful-webapp",
          "cms-contentful-backend",
        ],
      },
      {
        type: "category",
        label: "Dev tools",
        items: ["global-tools", "version-matrix"],
      },
    ],
    "Understanding SaaS Boilerplate": [
      "architecture",
      "cicd-architecture",
      "infrastructure-components",
    ],
    Docusaurus: ["style-guide"],
  },
};
