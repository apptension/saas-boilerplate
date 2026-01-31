let algoliaSearch = {};
if (process.env.ALGOLIA_APP_ID) {
  algoliaSearch = {
    algolia: {
      appId: process.env.ALGOLIA_APP_ID,
      apiKey: process.env.ALGOLIA_API_KEY,
      indexName: process.env.ALGOLIA_INDEX_NAME,
      contextualSearch: true,
    },
  };
}

let gtm = {};
if (process.env.GTM_CONTAINER_ID) {
  gtm = {
    googleTagManager: {
      containerId: process.env.GTM_CONTAINER_ID,
    },
  };
}

module.exports = {
  title: 'SaaS Boilerplate by Apptension',
  tagline: 'Build production-ready SaaS applications faster with our comprehensive starter kit',
  url: 'https://docs.demo.saas.apptoku.com',
  baseUrl: '/',
  onBrokenLinks: 'warn', // Changed from 'throw' - auto-generated TypeDoc docs have internal links that may not resolve
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',
  organizationName: 'Apptension',
  projectName: 'saas-boilerplate',

  // SEO & Social
  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'keywords',
        content: 'SaaS, boilerplate, React, TypeScript, AWS, Django, GraphQL, starter kit, multi-tenancy',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:image',
        content: '/img/logo.svg',
      },
    },
  ],

  themeConfig: {
    // Metadata
    metadata: [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'og:type', content: 'website' },
      { name: 'og:site_name', content: 'SaaS Boilerplate Documentation' },
    ],

    // Announcement bar for important updates
    announcementBar: {
      id: 'announcement-v4',
      content:
        '⭐ If you find SaaS Boilerplate useful, give us a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/apptension/saas-boilerplate">GitHub</a>!',
      backgroundColor: 'var(--ifm-color-primary)',
      textColor: '#ffffff',
      isCloseable: true,
    },

    // Documentation settings
    docs: {
      sidebar: {
        autoCollapseCategories: false,
        hideable: true,
      },
    },

    // Navbar
    navbar: {
      title: 'SaaS Boilerplate',
      hideOnScroll: false,
      logo: {
        alt: 'SaaS Boilerplate by Apptension',
        src: 'img/logo.svg',
        srcDark: 'img/logoDark.svg',
        width: 32,
        height: 32,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'gettingStartedSidebar',
          position: 'left',
          label: 'Quick Start',
        },
        {
          type: 'docSidebar',
          sidebarId: 'introductionSidebar',
          position: 'left',
          label: 'Overview',
        },
        {
          type: 'docSidebar',
          sidebarId: 'workingWithSidebar',
          position: 'left',
          label: 'How-To Guides',
        },
        {
          type: 'dropdown',
          label: 'Deployment',
          position: 'left',
          items: [
            {
              type: 'docSidebar',
              sidebarId: 'deploymentSidebar',
              label: 'All Options',
            },
            {
              type: 'docSidebar',
              sidebarId: 'awsSidebar',
              label: 'AWS (CDK)',
            },
            {
              type: 'doc',
              docId: 'deployment/render',
              label: 'Render.com',
            },
            {
              type: 'doc',
              docId: 'deployment/vps',
              label: 'VPS / Docker',
            },
          ],
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiReferenceSidebar',
          position: 'left',
          label: 'API Reference',
        },
        {
          type: 'search',
          position: 'right',
        },
        {
          label: 'Website',
          href: 'https://apptension.com/saas-boilerplate?utm_source=docs&utm_medium=referral&utm_campaign=SaaS%20Boilerplate&utm_term=SaaS%20Boilerplate',
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

    // Footer
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Get Started',
          items: [
            {
              label: 'Quick Start',
              to: '/getting-started',
            },
            {
              label: 'Overview',
              to: '/introduction',
            },
            {
              label: 'Architecture',
              to: '/introduction/architecture',
            },
          ],
        },
        {
          title: 'Learn',
          items: [
            {
              label: 'How-To Guides',
              to: '/working-with-sb',
            },
            {
              label: 'Deployment Options',
              to: '/deployment',
            },
            {
              label: 'AWS Deployment',
              to: '/aws',
            },
            {
              label: 'API Reference',
              to: '/api-reference',
            },
          ],
        },
        {
          title: 'Features',
          items: [
            {
              label: 'All Features',
              to: '/introduction/features',
            },
            {
              label: 'Authentication',
              to: '/introduction/features/auth',
            },
            {
              label: 'Payments',
              to: '/introduction/features/payments',
            },
            {
              label: 'Multi-tenancy',
              to: '/introduction/features/multi-tenancy',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/apptension/saas-boilerplate',
            },
            {
              label: 'Apptension',
              href: 'https://apptension.com?utm_source=docs&utm_medium=referral&utm_campaign=SaaS%20Boilerplate&utm_term=SaaS%20Boilerplate',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} SaaS Boilerplate by <a href="https://apptension.com?utm_source=docs&utm_medium=referral&utm_campaign=SaaS%20Boilerplate&utm_term=SaaS%20Boilerplate" target="_blank">Apptension</a>. Built with Docusaurus.`,
    },

    // Color mode
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    // Table of contents
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },

    // Prism syntax highlighting
    prism: {
      theme: require('prism-react-renderer').themes.github,
      darkTheme: require('prism-react-renderer').themes.vsDark,
      additionalLanguages: ['bash', 'python', 'json', 'graphql', 'yaml', 'typescript', 'tsx'],
    },

    ...algoliaSearch,
  },

  customFields: {
    projectName: 'SaaS Boilerplate',
    displayLocalUseInfo: process.env.SB_DISPLAY_LOCAL_USE_INFO || false,
    description:
      'A comprehensive production-ready SaaS starter kit with React, TypeScript, Django, GraphQL, and AWS infrastructure.',
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          breadcrumbs: true,
        },
        theme: {
          customCss: [require.resolve('./src/css/custom.css')],
        },
        ...gtm,
      },
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'typedoc-webapp-api-client',
        entryPoints: [
          '../../webapp-libs/webapp-api-client/src/hooks/index.ts',
          '../../webapp-libs/webapp-api-client/src/providers/index.ts',
          '../../webapp-libs/webapp-api-client/src/tests/utils/rendering.tsx',
          '../../webapp-libs/webapp-api-client/src/tests/utils/fixtures.ts',
        ],
        tsconfig: '../../webapp-libs/webapp-api-client/tsconfig.lib.json',
        out: 'api-reference/webapp-api-client/generated',
        readme: 'none',
        watch: process.env.TYPEDOC_WATCH,
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'typedoc-webapp-core',
        entryPoints: [
          '../../webapp-libs/webapp-core/src/utils/index.ts',
          '../../webapp-libs/webapp-core/src/hooks/index.ts',
          '../../webapp-libs/webapp-core/src/theme/index.ts',
          '../../webapp-libs/webapp-core/src/components/buttons/index.ts',
          '../../webapp-libs/webapp-core/src/components/forms/index.ts',
          '../../webapp-libs/webapp-core/src/tests/utils/rendering.tsx',
        ],
        tsconfig: '../../webapp-libs/webapp-core/tsconfig.lib.json',
        out: 'api-reference/webapp-core/generated',
        readme: 'none',
        watch: process.env.TYPEDOC_WATCH,
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'typedoc-webapp-tenants',
        entryPoints: [
          '../../webapp-libs/webapp-tenants/src/hooks/index.ts',
          '../../webapp-libs/webapp-tenants/src/providers/index.ts',
          '../../webapp-libs/webapp-tenants/src/tests/utils/rendering.tsx',
        ],
        tsconfig: '../../webapp-libs/webapp-tenants/tsconfig.lib.json',
        out: 'api-reference/webapp-tenants/generated',
        readme: 'none',
        watch: process.env.TYPEDOC_WATCH,
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'typedoc-webapp',
        entryPoints: [
          '../../webapp/src/app/providers/index.ts',
          '../../webapp/src/shared/components/routes/index.ts',
          '../../webapp/src/shared/utils/storybook.tsx',
          '../../webapp/src/tests/utils/rendering.tsx',
        ],
        tsconfig: '../../webapp/tsconfig.app.json',
        out: 'api-reference/webapp/generated',
        readme: 'none',
        watch: process.env.TYPEDOC_WATCH,
      },
    ],
  ],
};
