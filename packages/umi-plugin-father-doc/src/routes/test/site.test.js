import path from 'path';
import getRoute from '../getRouteConfigFromDir';
import decorateRoute from '../decorator';
import getMenu from '../getMenuFromRoutes';
import getNav from '../getNavFromRoutes';

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
        component: './packages/umi-plugin-father-doc/src/routes/fixtures/site/api.md',
        exact: true,
      },
      {
        path: '/',
        component: './packages/umi-plugin-father-doc/src/routes/fixtures/site/index.md',
        exact: true,
      },
      {
        path: '/zh-CN',
        component: './packages/umi-plugin-father-doc/src/routes/fixtures/site/index.zh-CN.md',
        exact: true,
      },
      {
        path: '/config',
        component: './packages/umi-plugin-father-doc/src/routes/fixtures/site/config/index.md',
        exact: true,
      },
      {
        path: '/config/others',
        component: './packages/umi-plugin-father-doc/src/routes/fixtures/site/config/others.md',
        exact: true,
      },
    ]);
  });

  it('route decorator', () => {
    const appRoot = path.join(FIXTURES_PATH, 'locale');

    routes = decorateRoute(
      routes,
      { locales: DEFAULT_LOCALES, mode: 'site' },
      {
        paths: {
          cwd: process.cwd(),
          absTmpDirPath: path.join(appRoot, '.umi'),
        },
      },
    );

    expect(routes).toEqual([
      {
        path: '/api',
        component: './packages/umi-plugin-father-doc/src/routes/fixtures/site/api.md',
        exact: true,
        meta: {
          slugs: [
            { depth: 1, value: 'config.a', heading: 'configa' },
            { depth: 1, value: 'config.b', heading: 'configb' },
          ],
          title: 'Api',
          nav: { path: '/api', title: 'Api' },
        },
        title: 'Api',
        Routes: [
          './packages/umi-plugin-father-doc/src/routes/fixtures/locale/.umi/TitleWrapper.jsx',
        ],
      },
      {
        path: '/',
        component: './packages/umi-plugin-father-doc/src/routes/fixtures/site/index.md',
        exact: true,
        meta: { slugs: [], title: 'Index' },
        title: 'Index',
        Routes: [
          './packages/umi-plugin-father-doc/src/routes/fixtures/locale/.umi/TitleWrapper.jsx',
        ],
      },
      {
        path: '/zh-CN',
        component: './packages/umi-plugin-father-doc/src/routes/fixtures/site/index.zh-CN.md',
        exact: true,
        meta: { slugs: [], locale: 'zh-CN', title: 'Index' },
        title: 'Index',
        Routes: [
          './packages/umi-plugin-father-doc/src/routes/fixtures/locale/.umi/TitleWrapper.jsx',
        ],
      },
      {
        path: '/config',
        component: './packages/umi-plugin-father-doc/src/routes/fixtures/site/config/index.md',
        exact: true,
        meta: {
          slugs: [],
          title: 'Index',
          nav: { path: '/config', title: 'Index' },
        },
        title: 'Index',
        Routes: [
          './packages/umi-plugin-father-doc/src/routes/fixtures/locale/.umi/TitleWrapper.jsx',
        ],
      },
      {
        path: '/config/others',
        component: './packages/umi-plugin-father-doc/src/routes/fixtures/site/config/others.md',
        exact: true,
        meta: {
          slugs: [],
          title: 'Others',
          nav: { path: '/config', title: 'Others' },
        },
        title: 'Others',
        Routes: [
          './packages/umi-plugin-father-doc/src/routes/fixtures/locale/.umi/TitleWrapper.jsx',
        ],
      },
      {
        path: '/zh-CN/api',
        component: './packages/umi-plugin-father-doc/src/routes/fixtures/site/api.md',
        exact: true,
        meta: {
          slugs: [
            { depth: 1, value: 'config.a', heading: 'configa' },
            { depth: 1, value: 'config.b', heading: 'configb' },
          ],
          title: 'Api',
          nav: { path: '/zh-CN/api', title: 'Api' },
          locale: 'zh-CN',
        },
        title: 'Api',
        Routes: [
          './packages/umi-plugin-father-doc/src/routes/fixtures/locale/.umi/TitleWrapper.jsx',
        ],
      },
      {
        path: '/zh-CN/config',
        component: './packages/umi-plugin-father-doc/src/routes/fixtures/site/config/index.md',
        exact: true,
        meta: {
          slugs: [],
          title: 'Index',
          nav: { path: '/zh-CN/config', title: 'Index' },
          locale: 'zh-CN',
        },
        title: 'Index',
        Routes: [
          './packages/umi-plugin-father-doc/src/routes/fixtures/locale/.umi/TitleWrapper.jsx',
        ],
      },
      {
        path: '/zh-CN/config/others',
        component: './packages/umi-plugin-father-doc/src/routes/fixtures/site/config/others.md',
        exact: true,
        meta: {
          slugs: [],
          title: 'Others',
          nav: { path: '/zh-CN/config', title: 'Others' },
          locale: 'zh-CN',
        },
        title: 'Others',
        Routes: [
          './packages/umi-plugin-father-doc/src/routes/fixtures/locale/.umi/TitleWrapper.jsx',
        ],
      },
    ]);
  });

  it('getNavFromRoutes', () => {
    const navs = getNav(routes, { locales: DEFAULT_LOCALES });

    expect(navs).toEqual({
      'en-US': [
        { path: '/api', title: 'Api' },
        { path: '/config', title: 'Others' },
      ],
      'zh-CN': [
        { path: '/zh-CN/api', title: 'Api' },
        { path: '/zh-CN/config', title: 'Others' },
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
            title: 'Api',
            meta: {
              slugs: [
                { depth: 1, value: 'config.a', heading: 'configa' },
                { depth: 1, value: 'config.b', heading: 'configb' },
              ],
              title: 'Api',
              nav: { path: '/api', title: 'Api' },
            },
          },
        ],
        '*': [
          {
            path: '/',
            title: 'Index',
            meta: { slugs: [], title: 'Index' },
          },
        ],
        '/config': [
          {
            path: '/config',
            title: 'Index',
            meta: {
              slugs: [],
              title: 'Index',
              nav: { path: '/config', title: 'Index' },
            },
          },
          {
            path: '/config/others',
            title: 'Others',
            meta: {
              slugs: [],
              title: 'Others',
              nav: { path: '/config', title: 'Others' },
            },
          },
        ],
      },
      'zh-CN': {
        '*': [
          {
            path: '/zh-CN',
            title: 'Index',
            meta: { slugs: [], locale: 'zh-CN', title: 'Index' },
          },
        ],
        '/zh-CN/api': [
          {
            path: '/zh-CN/api',
            title: 'Api',
            meta: {
              slugs: [
                { depth: 1, value: 'config.a', heading: 'configa' },
                { depth: 1, value: 'config.b', heading: 'configb' },
              ],
              title: 'Api',
              nav: { path: '/zh-CN/api', title: 'Api' },
              locale: 'zh-CN',
            },
          },
        ],
        '/zh-CN/config': [
          {
            path: '/zh-CN/config',
            title: 'Index',
            meta: {
              slugs: [],
              title: 'Index',
              nav: { path: '/zh-CN/config', title: 'Index' },
              locale: 'zh-CN',
            },
          },
          {
            path: '/zh-CN/config/others',
            title: 'Others',
            meta: {
              slugs: [],
              title: 'Others',
              nav: { path: '/zh-CN/config', title: 'Others' },
              locale: 'zh-CN',
            },
          },
        ],
      },
    });
  });
});
