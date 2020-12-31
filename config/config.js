export default {
  ssr: {},
  hash: true,
  title: 'dumi',
  mode: 'site',
  favicon: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
  navs: {
    'en-US': [
      null,
      { title: 'GitHub', path: 'https://github.com/umijs/dumi' },
      { title: 'Changelog', path: 'https://github.com/umijs/dumi/releases' },
    ],
    'zh-CN': [
      null,
      { title: 'GitHub', path: 'https://github.com/umijs/dumi' },
      { title: '更新日志', path: 'https://github.com/umijs/dumi/releases' },
    ],
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
  scripts: ['https://v1.cnzz.com/z_stat.php?id=1278653578&web_id=1278653578'],
  analytics: {
    ga: 'UA-128069695-2',
  },
  styles: ['a[title=站长统计] { display: none; }'],
  exportStatic: {},
  sitemap: {
    hostname: 'https://d.umijs.org',
  },
};
