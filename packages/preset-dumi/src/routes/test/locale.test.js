import path from 'path';
import getRoute from '../getRouteConfigFromDir';
import decorateRoute from '../decorator';
import getMenu from '../getMenuFromRoutes';
import getLocale from '../getLocaleFromRoutes';

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
          absTmpPath: path.join(process.cwd(), 'src/.umi'),
        },
      },
    );

    expect(routes).toEqual([
      {
        path: '/',
        component: '../../../packages/preset-dumi/src/routes/fixtures/locale/index.en-US.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/locale/index.en-US.md',
          updatedTime: 1582794297000,
          title: 'English',
          slugs: [],
          locale: 'en-US',
        },
        title: 'English',
      },
      {
        path: '/zh-CN',
        component: '../../../packages/preset-dumi/src/routes/fixtures/locale/index.zh-CN.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/locale/index.zh-CN.md',
          updatedTime: 1582794297000,
          title: '中文',
          slugs: [],
          locale: 'zh-CN',
        },
        title: '中文',
      },
      {
        path: '/missing/abc',
        component: '../../../packages/preset-dumi/src/routes/fixtures/locale/missing/abc.en-US.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/locale/missing/abc.en-US.md',
          updatedTime: 1582794297000,
          slugs: [],
          locale: 'en-US',
          title: 'Abc',
          group: { path: '/missing', title: 'Missing' },
        },
        title: 'Abc',
      },
      {
        path: '/group/abc',
        component: '../../../packages/preset-dumi/src/routes/fixtures/locale/sub/abc.en-US.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/locale/sub/abc.en-US.md',
          updatedTime: 1582794297000,
          group: { path: '/group', title: 'Group' },
          slugs: [],
          locale: 'en-US',
          title: 'Abc',
        },
        title: 'Abc',
      },
      {
        path: '/zh-CN/group/abc',
        component: '../../../packages/preset-dumi/src/routes/fixtures/locale/sub/abc.zh-CN.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/locale/sub/abc.zh-CN.md',
          updatedTime: 1582794297000,
          group: { path: '/zh-CN/group', title: 'Group' },
          slugs: [],
          locale: 'zh-CN',
          title: 'Abc',
        },
        title: 'Abc',
      },
      {
        path: '/sub',
        component: '../../../packages/preset-dumi/src/routes/fixtures/locale/sub/index.en-US.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/locale/sub/index.en-US.md',
          updatedTime: 1582794297000,
          slugs: [],
          locale: 'en-US',
          title: 'Index',
          group: { path: '/sub', title: 'Sub' },
        },
        title: 'Index',
      },
      {
        path: '/zh-CN/sub',
        component: '../../../packages/preset-dumi/src/routes/fixtures/locale/sub/index.zh-CN.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/locale/sub/index.zh-CN.md',
          updatedTime: 1582794297000,
          slugs: [],
          locale: 'zh-CN',
          title: 'Index',
          group: { path: '/zh-CN/sub', title: 'Sub' },
        },
        title: 'Index',
      },
      {
        path: '/zh-CN/missing/abc',
        component: '../../../packages/preset-dumi/src/routes/fixtures/locale/missing/abc.en-US.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/locale/missing/abc.en-US.md',
          updatedTime: 1582794297000,
          slugs: [],
          locale: 'zh-CN',
          title: 'Abc',
          group: { path: '/zh-CN/missing', title: 'Missing' },
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
          { path: '/', title: 'English', meta: {} },
          {
            title: 'Group',
            path: '/group',
            meta: {},
            children: [{ path: '/group/abc', title: 'Abc', meta: {} }],
          },
          {
            title: 'Missing',
            path: '/missing',
            meta: {},
            children: [{ path: '/missing/abc', title: 'Abc', meta: {} }],
          },
          {
            title: 'Sub',
            path: '/sub',
            meta: {},
            children: [{ path: '/sub', title: 'Index', meta: {} }],
          },
        ],
      },
      'zh-CN': {
        '*': [
          { path: '/zh-CN', title: '中文', meta: {} },
          {
            title: 'Group',
            path: '/zh-CN/group',
            meta: {},
            children: [{ path: '/zh-CN/group/abc', title: 'Abc', meta: {} }],
          },
          {
            title: 'Missing',
            path: '/zh-CN/missing',
            meta: {},
            children: [{ path: '/zh-CN/missing/abc', title: 'Abc', meta: {} }],
          },
          {
            title: 'Sub',
            path: '/zh-CN/sub',
            meta: {},
            children: [{ path: '/zh-CN/sub', title: 'Index', meta: {} }],
          },
        ],
      },
    });
  });

  it('getLocaleFromRoutes', () => {
    const locales = getLocale(routes, { locales: DEFAULT_LOCALES });

    expect(locales).toEqual([
      { name: 'en-US', label: 'EN' },
      { name: 'zh-CN', label: '中文' },
    ]);
  });
});
