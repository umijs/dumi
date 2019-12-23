import path from 'path';
import getRoute from './getRouteConfigFromDir';
import decorateRoute from './decorateRoutes';

describe('getRouteConfigFromDir', () => {
  it('normal', () => {
    const appRoot = path.join(__dirname, 'fixtures', 'normal');
    const routes = getRoute(appRoot);

    expect(decorateRoute(routes, {
      cwd: process.cwd(),
      absTmpDirPath: path.join(appRoot, '.umi'),
    })).toEqual(
      [
        {
          path: '/',
          component: './packages/umi-plugin-father-doc/src/routes/fixtures/normal/index.md',
          exact: true,
          meta: { title: 'Index' },
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
            title: 'Intro'
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
            title: 'Readme'
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
            group: { title: 'Rename Sub', path: '/sub' },
            title: 'HelloComponent'
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
          meta: { title: 'README', group: { title: 'Rename Sub' } },
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
            title: 'StillHello'
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
          path: '/rename-sub-sub',
          exact: true,
          meta: {},
          redirect: '/rename-sub-sub/still-hello',
          title: 'Rename-sub-sub'
        }
      ]
    );
  });
});
