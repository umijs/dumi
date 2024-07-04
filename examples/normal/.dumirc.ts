export default {
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'EN' },
  ],
  mako: {},
  ssr: { builder: 'webpack' },

  themeConfig: { name: '示例' },
  mfsu: false,
  apiParser: {},
  resolve: { entryFile: './src/index.ts' },
};
