export default {
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'EN' },
  ],
  themeConfig: { name: '示例', hd: {}, footer: '<div>Powered by dumi@2</div>' },
  mfsu: false,
  apiParser: {},
  resolve: { entryFile: './src/index.ts' },
};
