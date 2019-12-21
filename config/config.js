export default {
  // for GitHub Pages before prerender be supported
  history: 'hash',
  publicPath: '/father-doc/',
  doc: {
    title: 'father-doc',
    footer: {
      links: [
        {
          key: 'UmiJS',
          title: 'UmiJS',
          href: 'https://umijs.org/',
          blankTarget: true,
        },
        {
          key: 'GitHub',
          title: 'GitHub',
          href: 'https://github.com/umijs/father-doc/',
          blankTarget: true,
        },
        {
          key: 'father',
          title: 'father',
          href: 'https://github.com/umijs/father',
          blankTarget: true,
        },
      ],
      copyright: '❤️ Powered By Father',
    },
  },
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: 'css',
      },
    ],
  ],
};
