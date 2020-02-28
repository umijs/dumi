export default {
  publicPath: '/dumi/',
  base: '/dumi',
  title: 'Dumi',
  mode: 'site',
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
