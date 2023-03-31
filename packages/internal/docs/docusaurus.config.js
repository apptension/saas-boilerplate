module.exports = {
  title: 'SaaS Boilerplate by Apptension',
  tagline: 'SaaS Boilerplate is not a boiler on a plate',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/logo.svg',
  organizationName: 'apptension', // Usually your GitHub org/user name.
  projectName: 'saas-boilerplate-app', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'SaaS Boilerplate by Apptension',
      logo: {
        alt: 'SaaS Boilerplate by Apptension',
        src: 'img/logo.svg',
      },
      items: [],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} SaaS Boilerplate by Apptension.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
