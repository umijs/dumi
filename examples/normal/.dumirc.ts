export default {
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'EN' },
  ],
  themeConfig: {
    name: '示例',
    nav: [
      {
        title: 'Hello',
        link: '/hello',
      },
      {
        title: 'Nothing',
        link: '/nothing',
      },
      {
        title: '组件',
        link: '/components',
      },
    ],
    sidebar: {
      '/components': [
        {
          title: '通用',
          children: [
            '/components/foo',
          ]
        }
      ]
    }
  },
  mfsu: false,
  apiParser: {},
  resolve: { entryFile: './src/index.ts' },
};
