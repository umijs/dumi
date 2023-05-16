const names = [
  'skipProps1',
  'skipProps2'
];

export default {
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'EN' },
  ],
  themeConfig: { name: '示例' },
  mfsu: false,
  apiParser: {
    propFilter: {
      skipPropsWithName: names
    }
  },
  resolve: { entryFile: './src/index.ts' },
};
