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
        },
        {
          path: '/en-US/sub',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/sub/index.en-US.md',
          exact: true
        },
        {
          path: '/sub',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/sub/index.zh-CN.md',
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
        },
        {
          path: '/sub',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/sub/index.en-US.md',
          exact: true
        },
        {
          path: '/zh-CN/sub',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/sub/index.zh-CN.md',
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
          path: '/sub',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/sub/index.en-US.md',
          exact: true,
          meta: {
            group: { path: '/sub', title: 'Sub' },
            locale: 'en-US',
            title: 'Index',
            slugs: []
          },
          title: 'Index',
          Routes: [
            './packages/umi-plugin-father-doc/src/routes/fixtures/locale/.umi/TitleWrapper.jsx'
          ]
        },
        {
          path: '/zh-CN/sub',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/locale/sub/index.zh-CN.md',
          exact: true,
          meta: {
            group: { path: '/zh-CN/sub', title: 'Sub' },
            locale: 'zh-CN',
            title: 'Index',
            slugs: []
          },
          title: 'Index',
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
        {
          path: '/zh-CN/missing',
          meta: {},
          exact: true,
          redirect: '/zh-CN/missing/abc'
        }
      ]
    );
  });

  it('getMenuFromRoutes', () => {
    const menu = getMenu(routes, { locales: DEFAULT_LOCALES });

    expect(menu).toEqual(
      [
        {
          locale: { name: 'en-US', label: 'EN' },
          items: [
            {
              path: '/',
              title: 'English',
              meta: { locale: 'en-US', title: 'English', slugs: [] }
            },
            {
              title: 'Missing',
              path: '/missing',
              meta: {},
              children: [
                {
                  path: '/missing/abc',
                  title: 'Abc',
                  meta: {
                    group: { path: '/missing', title: 'Missing' },
                    locale: 'en-US',
                    title: 'Abc',
                    slugs: []
                  }
                }
              ]
            },
            {
              title: 'Sub',
              path: '/sub',
              meta: {},
              children: [
                {
                  path: '/sub/abc',
                  title: 'Abc',
                  meta: {
                    group: { path: '/sub', title: 'Sub' },
                    locale: 'en-US',
                    title: 'Abc',
                    slugs: []
                  }
                },
                {
                  path: '/sub',
                  title: 'Index',
                  meta: {
                    group: { path: '/sub', title: 'Sub' },
                    locale: 'en-US',
                    title: 'Index',
                    slugs: []
                  }
                }
              ]
            }
          ]
        },
        {
          locale: { name: 'zh-CN', label: '中文' },
          items: [
            {
              title: 'Missing',
              path: '/zh-CN/missing',
              meta: {},
              children: [
                {
                  path: '/zh-CN/missing/abc',
                  title: 'Abc',
                  meta: {
                    group: { path: '/zh-CN/missing', title: 'Missing' },
                    locale: 'zh-CN',
                    title: 'Abc',
                    slugs: []
                  }
                }
              ]
            },
            {
              title: 'Sub',
              path: '/zh-CN/sub',
              meta: {},
              children: [
                {
                  path: '/zh-CN/sub/abc',
                  title: 'Abc',
                  meta: {
                    group: { path: '/zh-CN/sub', title: 'Sub' },
                    locale: 'zh-CN',
                    title: 'Abc',
                    slugs: []
                  }
                },
                {
                  path: '/zh-CN/sub',
                  title: 'Index',
                  meta: {
                    group: { path: '/zh-CN/sub', title: 'Sub' },
                    locale: 'zh-CN',
                    title: 'Index',
                    slugs: []
                  }
                }
              ]
            },
            {
              path: '/zh-CN',
              title: '中文',
              meta: { locale: 'zh-CN', title: '中文', slugs: [] }
            }
          ]
        }
      ]
    );
  });
});
