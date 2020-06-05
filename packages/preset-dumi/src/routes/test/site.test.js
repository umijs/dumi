import path from 'path';
import getRoute from '../getRouteConfigFromDir';
import decorateRoute from '../decorator';
import getMenu from '../getMenuFromRoutes';
import getNav from '../getNavFromRoutes';
import getLocale from '../getLocaleFromRoutes';

const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures');

const DEFAULT_LOCALES = [
  ['en-US', 'EN'],
  ['zh-CN', '中文'],
];

describe('routes & menu: site mode', () => {
  let routes;

  it('getRouteConfigFromDir', () => {
    routes = getRoute(path.join(FIXTURES_PATH, 'site'), {
      locales: DEFAULT_LOCALES,
    });

    expect(routes).toEqual([
      {
        path: '/api',
        component: './packages/preset-dumi/src/routes/fixtures/site/api.md',
        exact: true,
      },
      {
        path: '/',
        component: './packages/preset-dumi/src/routes/fixtures/site/index.md',
        exact: true,
      },
      {
        path: '/zh-CN',
        component: './packages/preset-dumi/src/routes/fixtures/site/index.zh-CN.md',
        exact: true,
      },
      {
        path: '/config',
        component: './packages/preset-dumi/src/routes/fixtures/site/config/index.md',
        exact: true,
      },
      {
        path: '/config/others',
        component: './packages/preset-dumi/src/routes/fixtures/site/config/others.md',
        exact: true,
      },
      {
        component: './packages/preset-dumi/src/routes/fixtures/site/rewrite/index.md',
        exact: true,
        path: '/rewrite',
      },
    ]);
  });

  it('route decorator', () => {
    routes = decorateRoute(
      routes,
      { locales: DEFAULT_LOCALES, mode: 'site' },
      {
        paths: {
          cwd: process.cwd(),
          absTmpPath: path.join(process.cwd(), 'src/.umi'),
        },
      },
    );

    expect(routes).toEqual([
      {
        path: '/api',
        component: '../../../packages/preset-dumi/src/routes/fixtures/site/api.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/site/api.md',
          updatedTime: 1582794297000,
          slugs: [
            { depth: 2, value: 'config.a', heading: 'configa' },
            { depth: 2, value: 'config.b', heading: 'configb' },
          ],
          title: 'config.a',
          nav: { path: '/api', title: 'Api' },
        },
        title: 'config.a',
      },
      {
        path: '/',
        component: '../../../packages/preset-dumi/src/routes/fixtures/site/index.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/site/index.md',
          updatedTime: 1582794297000,
          slugs: [],
          title: 'Index',
        },
        title: 'Index',
      },
      {
        path: '/zh-CN',
        component: '../../../packages/preset-dumi/src/routes/fixtures/site/index.zh-CN.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/site/index.zh-CN.md',
          updatedTime: 1582794297000,
          slugs: [],
          locale: 'zh-CN',
          title: 'Index',
        },
        title: 'Index',
      },
      {
        path: '/config',
        component: '../../../packages/preset-dumi/src/routes/fixtures/site/config/index.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/site/config/index.md',
          updatedTime: 1582794297000,
          slugs: [],
          title: 'Index',
          nav: { path: '/config', title: 'Config' },
        },
        title: 'Index',
      },
      {
        path: '/config/others',
        component: '../../../packages/preset-dumi/src/routes/fixtures/site/config/others.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/site/config/others.md',
          updatedTime: 1582794297000,
          slugs: [],
          title: 'Others',
          nav: { path: '/config', title: 'Config' },
        },
        title: 'Others',
      },
      {
        path: '/test-rewrite/rewrite',
        component: '../../../packages/preset-dumi/src/routes/fixtures/site/rewrite/index.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/site/rewrite/index.md',
          updatedTime: 1582794297000,
          nav: { path: '/test-rewrite', title: 'Test-rewrite' },
          slugs: [],
          title: 'Index',
          group: { path: '/test-rewrite/rewrite', title: 'Rewrite' },
        },
        title: 'Index',
      },
      {
        path: '/zh-CN/api',
        component: '../../../packages/preset-dumi/src/routes/fixtures/site/api.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/site/api.md',
          updatedTime: 1582794297000,
          slugs: [
            { depth: 2, value: 'config.a', heading: 'configa' },
            { depth: 2, value: 'config.b', heading: 'configb' },
          ],
          title: 'config.a',
          nav: { path: '/zh-CN/api', title: 'Api' },
          locale: 'zh-CN',
        },
        title: 'config.a',
      },
      {
        path: '/zh-CN/config',
        component: '../../../packages/preset-dumi/src/routes/fixtures/site/config/index.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/site/config/index.md',
          updatedTime: 1582794297000,
          slugs: [],
          title: 'Index',
          nav: { path: '/zh-CN/config', title: 'Config' },
          locale: 'zh-CN',
        },
        title: 'Index',
      },
      {
        path: '/zh-CN/config/others',
        component: '../../../packages/preset-dumi/src/routes/fixtures/site/config/others.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/site/config/others.md',
          updatedTime: 1582794297000,
          slugs: [],
          title: 'Others',
          nav: { path: '/zh-CN/config', title: 'Config' },
          locale: 'zh-CN',
        },
        title: 'Others',
      },
      {
        path: '/zh-CN/test-rewrite/rewrite',
        component: '../../../packages/preset-dumi/src/routes/fixtures/site/rewrite/index.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/site/rewrite/index.md',
          updatedTime: 1582794297000,
          nav: { path: '/zh-CN/test-rewrite', title: 'Test-rewrite' },
          slugs: [],
          title: 'Index',
          group: { path: '/zh-CN/test-rewrite/rewrite', title: 'Rewrite' },
          locale: 'zh-CN',
        },
        title: 'Index',
      },
      {
        path: '/test-rewrite',
        meta: {},
        exact: true,
        redirect: '/test-rewrite/rewrite',
      },
      {
        path: '/zh-CN/test-rewrite',
        meta: {},
        exact: true,
        redirect: '/zh-CN/test-rewrite/rewrite',
      },
    ]);
  });

  it('getNavFromRoutes', () => {
    const navs = getNav(routes, { locales: DEFAULT_LOCALES, mode: 'site' });

    expect(navs).toEqual({
      'en-US': [
        { path: '/api', title: 'Api' },
        { path: '/config', title: 'Config' },
        { path: '/test-rewrite', title: 'Test-rewrite' },
      ],
      'zh-CN': [
        { path: '/zh-CN/api', title: 'Api' },
        { path: '/zh-CN/config', title: 'Config' },
        { path: '/zh-CN/test-rewrite', title: 'Test-rewrite' },
      ],
    });
  });

  it('getNavFromRoutes: merge user config', () => {
    const navs = getNav(
      routes,
      { locales: DEFAULT_LOCALES, mode: 'site' },
      {
        'en-US': [null, { title: 'test', path: '/test' }],
      },
    );

    expect(navs).toEqual({
      'en-US': [
        { path: '/api', title: 'Api' },
        { path: '/config', title: 'Config' },
        { path: '/test-rewrite', title: 'Test-rewrite' },
        { path: '/test', title: 'test' },
      ],
      'zh-CN': [
        { path: '/zh-CN/api', title: 'Api' },
        { path: '/zh-CN/config', title: 'Config' },
        { path: '/zh-CN/test-rewrite', title: 'Test-rewrite' },
      ],
    });
  });

  it('getMenuFromRoutes', () => {
    const menu = getMenu(routes, { locales: DEFAULT_LOCALES });

    expect(menu).toEqual({
      'en-US': {
        '/api': [
          {
            path: '/api',
            title: 'config.a',
            meta: {},
          },
        ],
        '*': [
          {
            path: '/',
            title: 'Index',
            meta: {},
          },
        ],
        '/config': [
          {
            path: '/config',
            title: 'Index',
            meta: {},
          },
          {
            path: '/config/others',
            title: 'Others',
            meta: {},
          },
        ],
        '/test-rewrite': [
          {
            title: 'Rewrite',
            path: '/test-rewrite/rewrite',
            meta: {},
            children: [
              {
                path: '/test-rewrite/rewrite',
                title: 'Index',
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
            title: 'Index',
            meta: {},
          },
        ],
        '/zh-CN/api': [
          {
            path: '/zh-CN/api',
            title: 'config.a',
            meta: {},
          },
        ],
        '/zh-CN/config': [
          {
            path: '/zh-CN/config',
            title: 'Index',
            meta: {},
          },
          {
            path: '/zh-CN/config/others',
            title: 'Others',
            meta: {},
          },
        ],
        '/zh-CN/test-rewrite': [
          {
            title: 'Rewrite',
            path: '/zh-CN/test-rewrite/rewrite',
            meta: {},
            children: [
              {
                path: '/zh-CN/test-rewrite/rewrite',
                title: 'Index',
                meta: {},
              },
            ],
          },
        ],
      },
    });
  });

  it('getMenuFromRoutes: merge user config', () => {
    const menu = getMenu(
      routes,
      {
        locales: DEFAULT_LOCALES,
        resolve: {
          includes: [''],
        },
        menus: {
          '/api': [
            {
              title: 'test',
              children: ['api'],
            },
          ],
          '/config': [
            {
              title: 'Config Menu',
              children: ['others', 'index'],
            },
          ],
        },
      },
      {
        cwd: process.cwd(),
        absTmpPath: path.join(process.cwd(), '.umi'),
      },
    );

    expect(menu).toEqual({
      'en-US': {
        '/api': [
          {
            title: 'test',
            children: [{ path: '/api', title: 'config.a' }],
          },
        ],
        '*': [{ path: '/', title: 'Index', meta: {} }],
        '/config': [
          {
            title: 'Config Menu',
            children: [
              { path: '/config/others', title: 'Others' },
              { path: '/', title: 'Index' },
            ],
          },
        ],
        '/test-rewrite': [
          {
            title: 'Rewrite',
            path: '/test-rewrite/rewrite',
            meta: {},
            children: [{ path: '/test-rewrite/rewrite', title: 'Index', meta: {} }],
          },
        ],
      },
      'zh-CN': {
        '*': [{ path: '/zh-CN', title: 'Index', meta: {} }],
        '/zh-CN/api': [{ path: '/zh-CN/api', title: 'config.a', meta: {} }],
        '/zh-CN/config': [
          { path: '/zh-CN/config', title: 'Index', meta: {} },
          { path: '/zh-CN/config/others', title: 'Others', meta: {} },
        ],
        '/zh-CN/test-rewrite': [
          {
            title: 'Rewrite',
            path: '/zh-CN/test-rewrite/rewrite',
            meta: {},
            children: [
              {
                path: '/zh-CN/test-rewrite/rewrite',
                title: 'Index',
                meta: {},
              },
            ],
          },
        ],
      },
    });
  });

  it('getLocaleFromRoutes', () => {
    // test for unique locale discard logic
    const locales = getLocale(routes, { locales: DEFAULT_LOCALES.reverse() });

    expect(locales).toEqual([]);
  });
});
