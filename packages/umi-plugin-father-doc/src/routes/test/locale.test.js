import path from 'path';
import getRoute from '../getRouteConfigFromDir';
import decorateRoute from '../decorateRoutes';
import getMenu from '../getMenuFromRoutes';

const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures');
const DEFAULT_LOCALES = [
  ['en-US', 'EN'],
  ['zh-CN', '中文'],
];

describe('routes & menu: locales', () => {
  let routes;

  it('getRouteConfigFromDir: custom', () => {
    routes = getRoute(
      path.join(FIXTURES_PATH, 'locale'),
      {
        locales: DEFAULT_LOCALES.slice().reverse(),
      });

    expect(routes).toEqual(
      [
        {
          path: '/en-US',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/index.en-US.md',
          exact: true
        },
        {
          path: '/',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/index.zh-CN.md',
          exact: true
        },
        {
          path: '/en-US/missing/abc',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/missing/abc.en-US.md',
          exact: true
        },
        {
          path: '/en-US/sub/abc',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/sub/abc.en-US.md',
          exact: true
        },
        {
          path: '/sub/abc',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/sub/abc.zh-CN.md',
          exact: true
        }
      ]
    );
  });

  it('getRouteConfigFromDir: default', () => {
    routes = getRoute(path.join(FIXTURES_PATH, 'locale'), { locales: DEFAULT_LOCALES });

    expect(routes).toEqual(
      [
        {
          path: '/',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/index.en-US.md',
          exact: true
        },
        {
          path: '/zh-CN',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/index.zh-CN.md',
          exact: true
        },
        {
          path: '/missing/abc',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/missing/abc.en-US.md',
          exact: true
        },
        {
          path: '/sub/abc',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/sub/abc.en-US.md',
          exact: true
        },
        {
          path: '/zh-CN/sub/abc',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/sub/abc.zh-CN.md',
          exact: true
        }
      ]
    );
  });

  it('decorateRoute', () => {
    const appRoot = path.join(FIXTURES_PATH, 'locale');

    routes = decorateRoute(
      routes,
      {
        cwd: process.cwd(),
        absTmpDirPath: path.join(appRoot, '.umi'),
      },
      { locales: DEFAULT_LOCALES }
    );

    expect(routes).toEqual(
      [
        {
          path: '/',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/index.en-US.md',
          exact: true,
          meta: { title: 'English', slugs: [], locale: 'en-US' },
          title: 'English',
          Routes: [
            './packages/umi-plugin-father-doc/src/routes/fixtures/locale/.umi/TitleWrapper.jsx'
          ]
        },
        {
          path: '/zh-CN',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/index.zh-CN.md',
          exact: true,
          meta: { title: '中文', slugs: [], locale: 'zh-CN' },
          title: '中文',
          Routes: [
            './packages/umi-plugin-father-doc/src/routes/fixtures/locale/.umi/TitleWrapper.jsx'
          ]
        },
        {
          path: '/missing/abc',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/missing/abc.en-US.md',
          exact: true,
          meta: {
            group: { path: '/missing', title: 'Missing' },
            locale: 'en-US',
            title: 'Abc',
            slugs: []
          },
          title: 'Abc',
          Routes: [
            './packages/umi-plugin-father-doc/src/routes/fixtures/locale/.umi/TitleWrapper.jsx'
          ]
        },
        {
          path: '/sub/abc',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/sub/abc.en-US.md',
          exact: true,
          meta: {
            group: { path: '/sub', title: 'Sub' },
            locale: 'en-US',
            title: 'Abc',
            slugs: []
          },
          title: 'Abc',
          Routes: [
            './packages/umi-plugin-father-doc/src/routes/fixtures/locale/.umi/TitleWrapper.jsx'
          ]
        },
        {
          path: '/zh-CN/sub/abc',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/sub/abc.zh-CN.md',
          exact: true,
          meta: {
            group: { path: '/zh-CN/sub', title: 'Sub' },
            locale: 'zh-CN',
            title: 'Abc',
            slugs: []
          },
          title: 'Abc',
          Routes: [
            './packages/umi-plugin-father-doc/src/routes/fixtures/locale/.umi/TitleWrapper.jsx'
          ]
        },
        {
          path: '/zh-CN/missing/abc',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/missing/abc.en-US.md',
          exact: true,
          meta: {
            group: { path: '/zh-CN/missing', title: 'Missing' },
            locale: 'zh-CN',
            title: 'Abc',
            slugs: []
          },
          title: 'Abc',
          Routes: [
            './packages/umi-plugin-father-doc/src/routes/fixtures/locale/.umi/TitleWrapper.jsx'
          ]
        },
        { path: '/missing', meta: {}, exact: true, redirect: '/missing/abc' },
        { path: '/sub', meta: {}, exact: true, redirect: '/sub/abc' },
        {
          path: '/zh-CN/sub',
          meta: {},
          exact: true,
          redirect: '/zh-CN/sub/abc'
        },
        {
          path: '/zh-CN/missing',
          meta: {},
          exact: true,
          redirect: '/zh-CN/missing/abc'
        }
      ]
    );
  });
});
