export default {
  ssr: {},
  hash: true,
  title: 'dumi',
  mode: 'site',
  favicon: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
  menus: {
    '/guide': [
      {
        title: '介绍',
        children: ['guide/index', 'guide/getting-started'],
      },
      {
        title: '写组件 Demo',
        children: ['guide/demo-principle', 'guide/demo-types', 'guide/control-demo-render'],
      },
      {
        title: '控制菜单和路由生成',
        children: [
          'guide/control-route-generate',
          'guide/control-menu-generate',
          'guide/control-nav-generate',
        ],
      },
      {
        title: '更多用法',
        children: ['guide/mode', 'guide/multi-language', 'guide/seo'],
      },
      {
        title: '其他',
        children: ['guide/migration', 'guide/faq'],
      },
    ],
  },
  navs: [
    null,
    { title: 'GitHub', path: 'https://github.com/umijs/dumi' },
    { title: '更新日志', path: 'https://github.com/umijs/dumi/releases' },
  ],
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
  styles: ['a[title=站长统计] { display: none; }'],
  exportStatic: {},
};
