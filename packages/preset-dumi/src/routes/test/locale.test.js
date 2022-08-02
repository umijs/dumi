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
        path: '/en-usfake/fake',
        component: './packages/preset-dumi/src/routes/fixtures/locale/en-USfake/fake.md',
        exact: true,
      },
      {
        path: '/en-US/en-usfake',
        component: './packages/preset-dumi/src/routes/fixtures/locale/en-USfake/index.en-US.md',
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
      {
        path: '/zh-cnfake',
        component: './packages/preset-dumi/src/routes/fixtures/locale/zh-CNfake/index.zh-CN.md',
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
        path: '/en-usfake/fake',
        component: './packages/preset-dumi/src/routes/fixtures/locale/en-USfake/fake.md',
        exact: true,
      },
      {
        path: '/en-usfake',
        component: './packages/preset-dumi/src/routes/fixtures/locale/en-USfake/index.en-US.md',
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
      {
        path: '/zh-CN/zh-cnfake',
        component: './packages/preset-dumi/src/routes/fixtures/locale/zh-CNfake/index.zh-CN.md',
        exact: true,
      },
    ]);
  });

  it('route decorator', () => {
    routes = decorateRoute(
      routes,
      {
        locales: DEFAULT_LOCALES,
        resolve: {
          includes: ['./packages/preset-dumi/src/routes/fixtures/locale'],
        },
      },
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
        path: '/en-usfake/fake',
        component: '../../../packages/preset-dumi/src/routes/fixtures/locale/en-USfake/fake.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/locale/en-USfake/fake.md',
          group: {
            path: '/en-usfake',
            title: 'En-USfake',
          },
          slugs: [],
          title: 'Fake',
          updatedTime: 1631697998000,
        },
        title: 'Fake',
      },
      {
        path: '/en-usfake',
        component:
          '../../../packages/preset-dumi/src/routes/fixtures/locale/en-USfake/index.en-US.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/locale/en-USfake/index.en-US.md',
          group: {
            path: '/en-usfake',
            title: 'En-USfake',
          },
          locale: 'en-US',
          slugs: [],
          title: 'En-USfake',
          updatedTime: 1631697998000,
        },
        title: 'En-USfake',
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
          group: { path: '/group', title: 'Sub' },
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
          group: { path: '/zh-CN/group', title: 'Sub' },
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
          title: 'Sub',
          group: { path: '/sub', title: 'Sub' },
        },
        title: 'Sub',
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
          title: 'Sub',
          group: { path: '/zh-CN/sub', title: 'Sub' },
        },
        title: 'Sub',
      },
      {
        path: '/zh-CN/zh-cnfake',
        component:
          '../../../packages/preset-dumi/src/routes/fixtures/locale/zh-CNfake/index.zh-CN.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/locale/zh-CNfake/index.zh-CN.md',
          group: {
            path: '/zh-CN/zh-cnfake',
            title: 'Zh-CNfake',
          },
          locale: 'zh-CN',
          slugs: [],
          title: 'Zh-CNfake',
          updatedTime: 1631697998000,
        },
        title: 'Zh-CNfake',
      },
      {
        path: '/zh-CN/en-usfake/fake',
        component: '../../../packages/preset-dumi/src/routes/fixtures/locale/en-USfake/fake.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/locale/en-USfake/fake.md',
          group: {
            path: '/zh-CN/en-usfake',
            title: 'En-USfake',
          },
          locale: 'zh-CN',
          slugs: [],
          title: 'Fake',
          updatedTime: 1631697998000,
        },
        title: 'Fake',
      },
      {
        path: '/zh-CN/en-usfake',
        component:
          '../../../packages/preset-dumi/src/routes/fixtures/locale/en-USfake/index.en-US.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/locale/en-USfake/index.en-US.md',
          group: {
            path: '/zh-CN/en-usfake',
            title: 'En-USfake',
          },
          locale: 'zh-CN',
          slugs: [],
          title: 'En-USfake',
          updatedTime: 1631697998000,
        },
        title: 'En-USfake',
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
            title: 'En-USfake',
            path: '/en-usfake',
            meta: {},
            children: [
              {
                path: '/en-usfake',
                title: 'En-USfake',
                meta: {},
              },
              {
                path: '/en-usfake/fake',
                title: 'Fake',
                meta: {},
              },
            ],
          },
          {
            title: 'Sub',
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
            children: [],
          },
        ],
      },
      'zh-CN': {
        '*': [
          { path: '/zh-CN', title: '中文', meta: {} },
          {
            children: [
              {
                path: '/zh-CN/en-usfake',
                title: 'En-USfake',
                meta: {},
              },
              {
                path: '/zh-CN/en-usfake/fake',
                title: 'Fake',
                meta: {},
              },
            ],
            path: '/zh-CN/en-usfake',
            title: 'En-USfake',
            meta: {},
          },
          {
            title: 'Sub',
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
            children: [],
          },
          {
            title: 'Zh-CNfake',
            path: '/zh-CN/zh-cnfake',
            meta: {},
            children: [],
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
