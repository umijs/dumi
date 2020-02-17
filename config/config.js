export default {
  // for GitHub Pages before prerender be supported
  history: 'hash',
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
