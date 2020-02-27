import path from 'path';
import getRoute from '../getRouteConfigFromDir';
import decorateRoute from '../decorator';
import getMenu from '../getMenuFromRoutes';

const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures');
const DEFAULT_LOCALES = [
  ['en-US', 'EN'],
  ['zh-CN', '中文'],
];

describe('routes & menu: locales', () => {
  let routes;

  it('getRouteConfigFromDir: custom', () => {
    routes = getRoute(path.join(FIXTURES_PATH, 'locale'), {
      locales: DEFAULT_LOCALES.slice().reverse(),
    });

    expect(routes).toEqual([
      {
        path: '/en-US',
        component: './packages/preset-dumi/src/routes/fixtures/locale/index.en-US.md',
        exact: true,
      },
      {
        path: '/',
        component: './packages/preset-dumi/src/routes/fixtures/locale/index.zh-CN.md',
        exact: true,
      },
      {
        path: '/en-US/missing/abc',
        component: './packages/preset-dumi/src/routes/fixtures/locale/missing/abc.en-US.md',
        exact: true,
      },
      {
        path: '/en-US/sub/abc',
        component: './packages/preset-dumi/src/routes/fixtures/locale/sub/abc.en-US.md',
        exact: true,
      },
      {
        path: '/sub/abc',
        component: './packages/preset-dumi/src/routes/fixtures/locale/sub/abc.zh-CN.md',
        exact: true,
      },
      {
        path: '/en-US/sub',
        component: './packages/preset-dumi/src/routes/fixtures/locale/sub/index.en-US.md',
        exact: true,
      },
      {
        path: '/sub',
        component: './packages/preset-dumi/src/routes/fixtures/locale/sub/index.zh-CN.md',
        exact: true,
      },
    ]);
  });

  it('getRouteConfigFromDir: default', () => {
    routes = getRoute(path.join(FIXTURES_PATH, 'locale'), {
      locales: DEFAULT_LOCALES,
    });

    expect(routes).toEqual([
      {
        path: '/',
        component: './packages/preset-dumi/src/routes/fixtures/locale/index.en-US.md',
        exact: true,
      },
      {
        path: '/zh-CN',
        component: './packages/preset-dumi/src/routes/fixtures/locale/index.zh-CN.md',
        exact: true,
      },
      {
        path: '/missing/abc',
        component: './packages/preset-dumi/src/routes/fixtures/locale/missing/abc.en-US.md',
        exact: true,
      },
      {
        path: '/sub/abc',
        component: './packages/preset-dumi/src/routes/fixtures/locale/sub/abc.en-US.md',
        exact: true,
      },
      {
        path: '/zh-CN/sub/abc',
        component: './packages/preset-dumi/src/routes/fixtures/locale/sub/abc.zh-CN.md',
        exact: true,
      },
      {
        path: '/sub',
        component: './packages/preset-dumi/src/routes/fixtures/locale/sub/index.en-US.md',
        exact: true,
      },
      {
        path: '/zh-CN/sub',
        component: './packages/preset-dumi/src/routes/fixtures/locale/sub/index.zh-CN.md',
        exact: true,
      },
    ]);
  });

  it('route decorator', () => {
    routes = decorateRoute(
      routes,
      { locales: DEFAULT_LOCALES },
      {
        paths: {
          cwd: process.cwd(),
          absTmpPath: path.join(process.cwd(), '.umi'),
        },
      },
    );

    expect(routes).toEqual([
      {
        path: '/',
        component: '../../packages/preset-dumi/src/routes/fixtures/locale/index.en-US.md',
        exact: true,
        meta: { title: 'English', slugs: [], locale: 'en-US' },
        title: 'English',
      },
      {
        path: '/zh-CN',
        component: '../../packages/preset-dumi/src/routes/fixtures/locale/index.zh-CN.md',
        exact: true,
        meta: { title: '中文', slugs: [], locale: 'zh-CN' },
        title: '中文',
      },
      {
        path: '/missing/abc',
        component: '../../packages/preset-dumi/src/routes/fixtures/locale/missing/abc.en-US.md',
        exact: true,
        meta: {
          group: { path: '/missing', title: 'Missing' },
          locale: 'en-US',
          title: 'Abc',
          slugs: [],
        },
        title: 'Abc',
      },
      {
        path: '/group/abc',
        component: '../../packages/preset-dumi/src/routes/fixtures/locale/sub/abc.en-US.md',
        exact: true,
        meta: {
          group: { path: '/group', title: 'Group' },
          locale: 'en-US',
          title: 'Abc',
          slugs: [],
        },
        title: 'Abc',
      },
      {
        path: '/zh-CN/group/abc',
        component: '../../packages/preset-dumi/src/routes/fixtures/locale/sub/abc.zh-CN.md',
        exact: true,
        meta: {
          group: { path: '/zh-CN/group', title: 'Group' },
          locale: 'zh-CN',
          title: 'Abc',
          slugs: [],
        },
        title: 'Abc',
      },
      {
        path: '/sub',
        component: '../../packages/preset-dumi/src/routes/fixtures/locale/sub/index.en-US.md',
        exact: true,
        meta: {
          group: { path: '/sub', title: 'Sub' },
          locale: 'en-US',
          title: 'Index',
          slugs: [],
        },
        title: 'Index',
      },
      {
        path: '/zh-CN/sub',
        component: '../../packages/preset-dumi/src/routes/fixtures/locale/sub/index.zh-CN.md',
        exact: true,
        meta: {
          group: { path: '/zh-CN/sub', title: 'Sub' },
          locale: 'zh-CN',
          title: 'Index',
          slugs: [],
        },
        title: 'Index',
      },
      {
        path: '/zh-CN/missing/abc',
        component: '../../packages/preset-dumi/src/routes/fixtures/locale/missing/abc.en-US.md',
        exact: true,
        meta: {
          group: { path: '/zh-CN/missing', title: 'Missing' },
          locale: 'zh-CN',
          title: 'Abc',
          slugs: [],
        },
        title: 'Abc',
      },
      { path: '/missing', meta: {}, exact: true, redirect: '/missing/abc' },
      { path: '/group', meta: {}, exact: true, redirect: '/group/abc' },
      {
        path: '/zh-CN/group',
        meta: {},
        exact: true,
        redirect: '/zh-CN/group/abc',
      },
      {
        path: '/zh-CN/missing',
        meta: {},
        exact: true,
        redirect: '/zh-CN/missing/abc',
      },
    ]);
  });

  it('getMenuFromRoutes', () => {
    const menu = getMenu(routes, { locales: DEFAULT_LOCALES });

    expect(menu).toEqual({
      'en-US': {
        '*': [
          {
            path: '/',
            title: 'English',
            meta: {},
          },
          {
            title: 'Sub',
            path: '/sub',
            meta: {},
            children: [
              {
                path: '/sub',
                title: 'Index',
                meta: {},
              },
            ],
          },
          {
            title: 'Group',
            path: '/group',
            meta: {},
            children: [
              {
                path: '/group/abc',
                title: 'Abc',
                meta: {},
              },
            ],
          },
          {
            title: 'Missing',
            path: '/missing',
            meta: {},
            children: [
              {
                path: '/missing/abc',
                title: 'Abc',
                meta: {},
              },
            ],
          },
        ],
      },
      'zh-CN': {
        '*': [
          {
            path: '/zh-CN',
            title: '中文',
            meta: {},
          },
          {
            title: 'Sub',
            path: '/zh-CN/sub',
            meta: {},
            children: [
              {
                path: '/zh-CN/sub',
                title: 'Index',
                meta: {},
              },
            ],
          },
          {
            title: 'Group',
            path: '/zh-CN/group',
            meta: {},
            children: [
              {
                path: '/zh-CN/group/abc',
                title: 'Abc',
                meta: {},
              },
            ],
          },
          {
            title: 'Missing',
            path: '/zh-CN/missing',
            meta: {},
            children: [
              {
                path: '/zh-CN/missing/abc',
                title: 'Abc',
                meta: {},
              },
            ],
          },
        ],
      },
    });
  });
});
