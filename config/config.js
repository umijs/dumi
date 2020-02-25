export default {
  publicPath: '/dumi/',
  base: '/dumi',
  doc: {
    title: 'Dumi',
    mode: 'site',
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
