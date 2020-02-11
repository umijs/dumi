import path from 'path';
import getRoute from '../getRouteConfigFromDir';
import decorateRoute from '../decorateRoutes';
import getMenu from '../getMenuFromRoutes';

const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures');

describe('routes & menu: normal', () => {
  let routes;

  it('getRouteConfigFromDir', () => {
    routes = getRoute(path.join(FIXTURES_PATH, 'normal'), { locales: [] });
    expect(routes).toEqual(
      [
        {
          path: '/',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/normal/index.md',
          exact: true
        },
        {
          path: '/intro',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/normal/intro.md',
          exact: true
        },
        {
          path: '/index',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/normal/index/readme.md',
          exact: true
        },
        {
          path: '/sub/hello-component',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/normal/sub/HelloComponent.md',
          exact: true
        },
        {
          path: '/sub',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/normal/sub/README.md',
          exact: true
        },
        {
          path: '/sub/subsub/still-hello',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/normal/sub/subsub/stillHello.md',
          exact: true
        },
        {
          path: '/sub/subsub/y-end',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/normal/sub/subsub/yEnd.md',
          exact: true
        }
      ]
    );
  });

  it('decorateRoutes', () => {
    const appRoot = path.join(FIXTURES_PATH, 'normal');

    routes = decorateRoute(routes, {
      cwd: process.cwd(),
      absTmpDirPath: path.join(appRoot, '.umi'),
    }, { locales: [] });
    expect(routes).toEqual(
      [
        {
          path: '/',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/normal/index.md',
          exact: true,
          meta: { title: 'Index', slugs: [] },
          title: 'Index',
          Routes: [
            './packages/umi-plugin-father-doc/src/routes/fixtures/normal/.umi/TitleWrapper.jsx'
          ]
        },
        {
          path: '/test/intro',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/normal/intro.md',
          exact: true,
          meta: {
            group: { title: 'Test', path: '/test' },
            title: 'Intro',
            slugs: []
          },
          title: 'Intro',
          Routes: [
            './packages/umi-plugin-father-doc/src/routes/fixtures/normal/.umi/TitleWrapper.jsx'
          ]
        },
        {
          path: '/index',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/normal/index/readme.md',
          exact: true,
          meta: {
            group: { title: 'Index', path: '/index' },
            legacy: '/legacy/path/test',
            title: 'Readme',
            slugs: []
          },
          title: 'Readme',
          Routes: [
            './packages/umi-plugin-father-doc/src/routes/fixtures/normal/.umi/TitleWrapper.jsx'
          ]
        },
        {
          path: '/sub/hello-component',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/normal/sub/HelloComponent.md',
          exact: true,
          meta: {
            group: {
              order: 10,
              title: 'Rename Sub',
              path: '/sub'
            },
            title: 'HelloComponent',
            slugs: []
          },
          title: 'HelloComponent',
          Routes: [
            './packages/umi-plugin-father-doc/src/routes/fixtures/normal/.umi/TitleWrapper.jsx'
          ]
        },
        {
          path: '/sub',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/normal/sub/README.md',
          exact: true,
          meta: {
            title: 'README',
            group: {
              order: 10,
              title: 'Rename Sub',
              path: '/sub'
            },
            slugs: []
          },
          title: 'README',
          Routes: [
            './packages/umi-plugin-father-doc/src/routes/fixtures/normal/.umi/TitleWrapper.jsx'
          ]
        },
        {
          path: '/rename-sub-sub/still-hello',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/normal/sub/subsub/stillHello.md',
          exact: true,
          meta: {
            group: { title: 'Rename-sub-sub', path: '/rename-sub-sub' },
            title: 'StillHello',
            slugs: []
          },
          title: 'StillHello',
          Routes: [
            './packages/umi-plugin-father-doc/src/routes/fixtures/normal/.umi/TitleWrapper.jsx'
          ]
        },
        {
          path: '/rename-sub-sub/y-end',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/normal/sub/subsub/yEnd.md',
          exact: true,
          meta: {
            group: { title: 'Rename-sub-sub', path: '/rename-sub-sub' },
            title: 'YEnd',
            order: 1,
            slugs: []
          },
          title: 'YEnd',
          Routes: [
            './packages/umi-plugin-father-doc/src/routes/fixtures/normal/.umi/TitleWrapper.jsx'
          ]
        },
        {
          path: '/test',
          exact: true,
          meta: {},
          redirect: '/test/intro'
        },
        {
          path: '/legacy/path/test',
          exact: true,
          redirect: '/index'
        },
        {
          path: '/rename-sub-sub',
          exact: true,
          meta: {},
          redirect: '/rename-sub-sub/y-end'
        }
      ]
    );
  });

  it('getMenuFromRoutes', () => {
    const menu = getMenu(routes, { locales: [] });

    expect(menu).toEqual(
      [
        {
          items: [
            {
              title: 'Rename Sub',
              path: '/sub',
              meta: { order: 10 },
              children: [
                {
                  path: '/sub/hello-component',
                  title: 'HelloComponent',
                  meta: {
                    group: { path: '/sub', title: 'Rename Sub', order: 10 },
                    title: 'HelloComponent',
                    slugs: []
                  }
                },
                {
                  path: '/sub',
                  title: 'README',
                  meta: {
                    group: { path: '/sub', title: 'Rename Sub', order: 10 },
                    title: 'README',
                    slugs: []
                  }
                }
              ]
            },
            {
              path: '/',
              title: 'Index',
              meta: { title: 'Index', slugs: [] }
            },
            {
              title: 'Index',
              path: '/index',
              meta: {},
              children: [
                {
                  path: '/index',
                  title: 'Readme',
                  meta: {
                    group: { path: '/index', title: 'Index' },
                    title: 'Readme',
                    legacy: '/legacy/path/test',
                    slugs: []
                  }
                }
              ]
            },
            {
              title: 'Rename-sub-sub',
              path: '/rename-sub-sub',
              meta: {},
              children: [
                {
                  path: '/rename-sub-sub/y-end',
                  title: 'YEnd',
                  meta: {
                    group: { path: '/rename-sub-sub', title: 'Rename-sub-sub' },
                    title: 'YEnd',
                    order: 1,
                    slugs: []
                  }
                },
                {
                  path: '/rename-sub-sub/still-hello',
                  title: 'StillHello',
                  meta: {
                    group: { path: '/rename-sub-sub', title: 'Rename-sub-sub' },
                    title: 'StillHello',
                    slugs: []
                  }
                }
              ]
            },
            {
              title: 'Test',
              path: '/test',
              meta: {},
              children: [
                {
                  path: '/test/intro',
                  title: 'Intro',
                  meta: {
                    title: 'Intro',
                    group: { path: '/test', title: 'Test' },
                    slugs: []
                  }
                }
              ]
            }
          ]
        }
      ]
    );
  });
});
