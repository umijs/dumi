export default {
  publicPath: '/father-doc/',
  doc: {
    title: 'father-doc',
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
