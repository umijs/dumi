import path from 'path';
import getRoute from './getRouteConfigFromDir';

describe('getRouteConfigFromDir', () => {
  it('normal', () => {
    expect(getRoute(path.join(__dirname, 'fixtures', 'normal'))).toEqual(
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
});
