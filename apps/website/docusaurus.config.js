const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '基于 Tango 开发低代码生产力工具',
  tagline: '基于源代码 AST 实现可视化搭建操作，支持实时出码，不受私有 DSL 和协议限制',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://netease.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/tango',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'netease', // Usually your GitHub org/user name.
  projectName: 'tango', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: '',
        logo: {
          alt: 'Tango Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'designer',
            position: 'left',
            label: '引擎文档',
          },
          {
            type: 'docSidebar',
            sidebarId: 'boot',
            position: 'left',
            label: '应用框架',
          },
          {
            type: 'docSidebar',
            sidebarId: 'protocol',
            position: 'left',
            label: '协议',
          },
          { to: '/blog', label: '博客', position: 'right' },
          {
            href: 'https://tango-demo.musicfe.com/designer/',
            label: '演示应用',
            position: 'right',
          },
          {
            href: 'https://github.com/netease/tango',
            label: 'GitHub',
            position: 'right',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '文档',
            items: [
              {
                label: '快速开始',
                to: '/docs/designer/quick-start',
              },
            ],
          },
          {
            title: '社区',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/netease-tango',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
            ],
          },
          {
            title: '更多',
            items: [
              {
                label: '博客',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/netease/tango',
              },
            ],
          },
        ],
        logo: {
          alt: 'NetEase Cloud Music',
          src: 'https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/15400855445/6c8b/10d4/a8a8/452c8518b0c0a660549996d366cdff77.png',
          width: 320,
        },
        copyright: `Copyright © ${new Date().getFullYear()} NetEase Cloud Music, Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
