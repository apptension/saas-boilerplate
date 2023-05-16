module.exports = {
  title: 'SaaS Boilerplate by Apptension',
  tagline: 'SaaS Boilerplate is not a boiler on a plate',
  url: 'https://docs.demo.saas.apptoku.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/logo.svg',
  organizationName: 'Apptension',
  projectName: 'saas-boilerplate',
  themeConfig: {
    docs: {
      sidebar: {
        autoCollapseCategories: false,
      },
    },
    navbar: {
      title: 'SaaS Boilerplate by Apptension',
      logo: {
        alt: 'SaaS Boilerplate by Apptension',
        src: 'img/logo.svg',
      },
      items: [
        {
          label: 'SaaS Boilerplate website',
          href: 'https://apptension.com/saas-boilerplate',
          position: 'right',
        },
        {
          href: 'https://github.com/apptension/saas-boilerplate',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} SaaS Boilerplate by <a href="https://apptension.com" target="_blank">Apptension</a>.`,
    },
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
  },
  customFields: {
    projectName: 'SaaS Boilerplate',
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
