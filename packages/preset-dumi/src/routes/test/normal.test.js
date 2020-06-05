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
        component: './packages/preset-dumi/src/routes/fixtures/normal/index.md',
        exact: true,
      },
      {
        path: '/intro',
        component: './packages/preset-dumi/src/routes/fixtures/normal/intro.md',
        exact: true,
      },
      {
        path: '/index',
        component: './packages/preset-dumi/src/routes/fixtures/normal/index/readme.md',
        exact: true,
      },
      {
        path: '/sub/hello-component',
        component: './packages/preset-dumi/src/routes/fixtures/normal/sub/HelloComponent.md',
        exact: true,
      },
      {
        path: '/sub',
        component: './packages/preset-dumi/src/routes/fixtures/normal/sub/README.md',
        exact: true,
      },
      {
        path: '/sub/subsub/still-hello',
        component: './packages/preset-dumi/src/routes/fixtures/normal/sub/subsub/stillHello.md',
        exact: true,
      },
      {
        path: '/sub/subsub/y-end',
        component: './packages/preset-dumi/src/routes/fixtures/normal/sub/subsub/yEnd.md',
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
          absTmpPath: path.join(process.cwd(), 'src/.umi'),
        },
      },
    );

    expect(routes).toEqual([
      {
        path: '/',
        component: '../../../packages/preset-dumi/src/routes/fixtures/normal/index.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/normal/index.md',
          updatedTime: 1582794297000,
          slugs: [],
          title: 'Index',
        },
        title: 'Index',
      },
      {
        path: '/test/intro',
        component: '../../../packages/preset-dumi/src/routes/fixtures/normal/intro.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/normal/intro.md',
          updatedTime: 1582794297000,
          title: 'Intro',
          group: { path: '/test', title: 'Test' },
          slugs: [],
        },
        title: 'Intro',
      },
      {
        path: '/index',
        component: '../../../packages/preset-dumi/src/routes/fixtures/normal/index/readme.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/normal/index/readme.md',
          updatedTime: 1582794297000,
          legacy: '/legacy/path/test',
          slugs: [],
          title: 'Readme',
          group: { path: '/index', title: 'Index' },
        },
        title: 'Readme',
      },
      {
        path: '/sub/hello-component',
        component: '../../../packages/preset-dumi/src/routes/fixtures/normal/sub/HelloComponent.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/normal/sub/HelloComponent.md',
          updatedTime: 1582794297000,
          group: { title: 'Rename Sub', order: 10, path: '/sub' },
          slugs: [],
          title: 'HelloComponent',
        },
        title: 'HelloComponent',
      },
      {
        path: '/sub',
        component: '../../../packages/preset-dumi/src/routes/fixtures/normal/sub/README.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/normal/sub/README.md',
          updatedTime: 1582794297000,
          group: { title: 'Rename Sub', order: 10, path: '/sub' },
          slugs: [],
          title: 'README',
        },
        title: 'README',
      },
      {
        path: '/rename-sub-sub/still-hello',
        component:
          '../../../packages/preset-dumi/src/routes/fixtures/normal/sub/subsub/stillHello.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/normal/sub/subsub/stillHello.md',
          updatedTime: 1582794297000,
          group: { path: '/rename-sub-sub', title: 'Rename-sub-sub' },
          slugs: [],
          title: 'StillHello',
        },
        title: 'StillHello',
      },
      {
        path: '/rename-sub-sub/y-end',
        component: '../../../packages/preset-dumi/src/routes/fixtures/normal/sub/subsub/yEnd.md',
        exact: true,
        meta: {
          filePath: 'packages/preset-dumi/src/routes/fixtures/normal/sub/subsub/yEnd.md',
          updatedTime: 1582794297000,
          order: 1,
          group: { path: '/rename-sub-sub', title: 'Rename-sub-sub' },
          slugs: [],
          title: 'YEnd',
        },
        title: 'YEnd',
      },
      { path: '/test', meta: {}, exact: true, redirect: '/test/intro' },
      { path: '/legacy/path/test', exact: true, redirect: '/index' },
      {
        path: '/rename-sub-sub',
        meta: {},
        exact: true,
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
              { path: '/sub', title: 'README', meta: {} },
              {
                path: '/sub/hello-component',
                title: 'HelloComponent',
                meta: {},
              },
            ],
          },
          { path: '/', title: 'Index', meta: {} },
          {
            title: 'Index',
            path: '/index',
            meta: {},
            children: [{ path: '/index', title: 'Readme', meta: {} }],
          },
          {
            title: 'Rename-sub-sub',
            path: '/rename-sub-sub',
            meta: {},
            children: [
              {
                path: '/rename-sub-sub/y-end',
                title: 'YEnd',
                meta: { order: 1 },
              },
              {
                path: '/rename-sub-sub/still-hello',
                title: 'StillHello',
                meta: {},
              },
            ],
          },
          {
            title: 'Test',
            path: '/test',
            meta: {},
            children: [{ path: '/test/intro', title: 'Intro', meta: {} }],
          },
        ],
      },
    });
  });
});
