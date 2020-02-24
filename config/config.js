export default {
  publicPath: '/father-doc/',
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
