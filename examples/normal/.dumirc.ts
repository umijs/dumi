export default {
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'EN' },
  ],
  mako: {},
  ssr: process.platform === 'win32' ? false : { builder: 'mako' },

  themeConfig: { name: '示例' },
  mfsu: false,
  resolve: { entryFile: './src/index.ts' },
};
