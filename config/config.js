export default {
  title: 'Dumi',
  mode: 'site',
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
        children: ['guide/mode', 'guide/multi-language', 'guide/migration'],
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
};
