export default {
  history: { type: 'memory' },
  mountElementId: '',
  mode: 'site',
  resolve: {
    includes: ['src/components'],
  },
  menus: {
    '/hello': [
      {
        title: 'Hello',
        children: ['Hello'],
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
  routes: [
    {
      path: '/A',
      component: './A'
    },
    {
      path: '/',
      redirect: '/~docs'
    }
  ],
  plugins: ['./wrapper.ts'],
  exportStatic: {},
}