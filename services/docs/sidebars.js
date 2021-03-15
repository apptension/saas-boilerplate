module.exports = {
  someSidebar: {
    Introduction: ["index", "aws-setup", "aws-deployment", "aws-auto-deploy"],
    Guides: ["aws-environment", "ssh-bastion"],
    Features: [
      "sentry",
      "emails",
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
