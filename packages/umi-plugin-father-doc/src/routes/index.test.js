import path from 'path';
import getRoute from './getRouteConfigFromDir';
import decorateRoute from './decorateRoutes';
import getMenu from './getMenuFromRoutes';

describe('routes & menu', () => {
  let routes;

  it('getRouteConfigFromDir: normal', () => {
    routes = getRoute(path.join(__dirname, 'fixtures', 'normal'));
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
        }
      ]
    );
  });

  it('decorateRoutes: normal', () => {
    const appRoot = path.join(__dirname, 'fixtures', 'normal');

    routes = decorateRoute(routes, {
      cwd: process.cwd(),
      absTmpDirPath: path.join(appRoot, '.umi'),
    });
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
              title: 'Rename Sub'
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
          path: '/test',
          exact: true,
          meta: {},
          redirect: '/test/intro',
          title: 'Test'
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
          redirect: '/rename-sub-sub/still-hello',
          title: 'Rename-sub-sub'
        }
      ]
    );
  });

  it('getMenuFromRoutes: normal', () => {
    const menu = getMenu(routes);

    expect(menu).toEqual(
      [
        {
          path: '/sub',
          title: 'Rename Sub',
          meta: {
            order: 10,
          },
          children: [
            {
              path: '/sub/hello-component',
              title: 'HelloComponent',
              meta: {
                group: { order: 10, path: '/sub', title: 'Rename Sub' },
                title: 'HelloComponent',
                slugs: []
              }
            }
          ]
        },
        { path: '/', title: 'Index', meta: { title: 'Index', slugs: [] } },
        {
          path: '/sub',
          title: 'README',
          meta: { title: 'README', group: { order: 10, title: 'Rename Sub' }, slugs: [] }
        },
        {
          path: '/test',
          title: 'Test',
          meta: {},
          children: [
            {
              path: '/test/intro',
              title: 'Intro',
              meta: { title: 'Intro', group: { path: '/test', title: 'Test' }, slugs: [] }
            }
          ]
        },
        {
          path: '/index',
          title: 'Index',
          meta: {},
          children: [
            {
              path: '/index',
              title: 'Readme',
              meta: {
                group: { path: '/index', title: 'Index' },
                legacy: '/legacy/path/test',
                title: 'Readme',
                slugs: []
              }
            }
          ]
        },
        {
          path: '/rename-sub-sub',
          title: 'Rename-sub-sub',
          meta: {},
          children: [
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
        }
      ]
    );
  });
});
