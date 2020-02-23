import path from 'path';
import getRoute from '../getRouteConfigFromDir';
import decorateRoute from '../decorator';
import getMenu from '../getMenuFromRoutes';

const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures');

describe('routes & menu: normal', () => {
  let routes;

  it('getRouteConfigFromDir', () => {
    routes = getRoute(path.join(FIXTURES_PATH, 'normal'), { locales: [] });
    expect(routes).toEqual([
      {
        path: '/',
        component: './packages/umi-plugin-dumi/src/routes/fixtures/normal/index.md',
        exact: true,
      },
      {
        path: '/intro',
        component: './packages/umi-plugin-dumi/src/routes/fixtures/normal/intro.md',
        exact: true,
      },
      {
        path: '/index',
        component: './packages/umi-plugin-dumi/src/routes/fixtures/normal/index/readme.md',
        exact: true,
      },
      {
        path: '/sub/hello-component',
        component: './packages/umi-plugin-dumi/src/routes/fixtures/normal/sub/HelloComponent.md',
        exact: true,
      },
      {
        path: '/sub',
        component: './packages/umi-plugin-dumi/src/routes/fixtures/normal/sub/README.md',
        exact: true,
      },
      {
        path: '/sub/subsub/still-hello',
        component: './packages/umi-plugin-dumi/src/routes/fixtures/normal/sub/subsub/stillHello.md',
        exact: true,
      },
      {
        path: '/sub/subsub/y-end',
        component: './packages/umi-plugin-dumi/src/routes/fixtures/normal/sub/subsub/yEnd.md',
        exact: true,
      },
    ]);
  });

  it('route decorator', () => {
    routes = decorateRoute(
      routes,
      { locales: [] },
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
        component: '../../packages/umi-plugin-dumi/src/routes/fixtures/normal/index.md',
        exact: true,
        meta: { title: 'Index', slugs: [] },
        title: 'Index',
      },
      {
        path: '/test/intro',
        component: '../../packages/umi-plugin-dumi/src/routes/fixtures/normal/intro.md',
        exact: true,
        meta: {
          group: { title: 'Test', path: '/test' },
          title: 'Intro',
          slugs: [],
        },
        title: 'Intro',
      },
      {
        path: '/index',
        component: '../../packages/umi-plugin-dumi/src/routes/fixtures/normal/index/readme.md',
        exact: true,
        meta: {
          group: { title: 'Index', path: '/index' },
          legacy: '/legacy/path/test',
          title: 'Readme',
          slugs: [],
        },
        title: 'Readme',
      },
      {
        path: '/sub/hello-component',
        component:
          '../../packages/umi-plugin-dumi/src/routes/fixtures/normal/sub/HelloComponent.md',
        exact: true,
        meta: {
          group: {
            order: 10,
            title: 'Rename Sub',
            path: '/sub',
          },
          title: 'HelloComponent',
          slugs: [],
        },
        title: 'HelloComponent',
      },
      {
        path: '/sub',
        component: '../../packages/umi-plugin-dumi/src/routes/fixtures/normal/sub/README.md',
        exact: true,
        meta: {
          title: 'README',
          group: {
            order: 10,
            title: 'Rename Sub',
            path: '/sub',
          },
          slugs: [],
        },
        title: 'README',
      },
      {
        path: '/rename-sub-sub/still-hello',
        component:
          '../../packages/umi-plugin-dumi/src/routes/fixtures/normal/sub/subsub/stillHello.md',
        exact: true,
        meta: {
          group: { title: 'Rename-sub-sub', path: '/rename-sub-sub' },
          title: 'StillHello',
          slugs: [],
        },
        title: 'StillHello',
      },
      {
        path: '/rename-sub-sub/y-end',
        component: '../../packages/umi-plugin-dumi/src/routes/fixtures/normal/sub/subsub/yEnd.md',
        exact: true,
        meta: {
          group: { title: 'Rename-sub-sub', path: '/rename-sub-sub' },
          title: 'YEnd',
          order: 1,
          slugs: [],
        },
        title: 'YEnd',
      },
      {
        path: '/test',
        exact: true,
        meta: {},
        redirect: '/test/intro',
      },
      {
        path: '/legacy/path/test',
        exact: true,
        redirect: '/index',
      },
      {
        path: '/rename-sub-sub',
        exact: true,
        meta: {},
        redirect: '/rename-sub-sub/y-end',
      },
    ]);
  });

  it('getMenuFromRoutes', () => {
    const menu = getMenu(routes, { locales: [] });

    expect(menu).toEqual({
      '*': {
        '*': [
          {
            title: 'Rename Sub',
            path: '/sub',
            meta: { order: 10 },
            children: [
              {
                path: '/sub',
                title: 'README',
                meta: {
                  group: { title: 'Rename Sub', order: 10, path: '/sub' },
                  slugs: [],
                  title: 'README',
                },
              },
              {
                path: '/sub/hello-component',
                title: 'HelloComponent',
                meta: {
                  group: { title: 'Rename Sub', order: 10, path: '/sub' },
                  slugs: [],
                  title: 'HelloComponent',
                },
              },
            ],
          },
          {
            path: '/',
            title: 'Index',
            meta: { slugs: [], title: 'Index' },
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
                  slugs: [],
                },
              },
            ],
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
                  legacy: '/legacy/path/test',
                  slugs: [],
                  title: 'Readme',
                  group: { path: '/index', title: 'Index' },
                },
              },
            ],
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
                  order: 1,
                  group: { path: '/rename-sub-sub', title: 'Rename-sub-sub' },
                  slugs: [],
                  title: 'YEnd',
                },
              },
              {
                path: '/rename-sub-sub/still-hello',
                title: 'StillHello',
                meta: {
                  group: { path: '/rename-sub-sub', title: 'Rename-sub-sub' },
                  slugs: [],
                  title: 'StillHello',
                },
              },
            ],
          },
        ],
      },
    });
  });
});
