export default {
  mode: 'site',
  resolve: {
    includes: ['src/components'],
  },
  menus: {
    '/hello': [
      {
        title: 'Hello',
        children: ['src/components/Hello'],
      },
    ],
  },
  navs: {
    'zh-CN': [
      null,
      {
        title: 'Test',
        path: '/hello',
      },
      {
        title: 'External',
        path: 'https://d.umijs.org',
      },
    ],
  },
}