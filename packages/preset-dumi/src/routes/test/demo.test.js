import path from 'path';
import getRoute from '../getRouteConfigFromDir';
import decorateRoute from '../decorator';
import getDemoRoutes from '../getDemoRoutes';

const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures');

describe('routes: demo', () => {
  let routes;

  it('getDemoRoutes', () => {
    routes = getRoute(path.join(FIXTURES_PATH, 'demo'), { locales: [] });
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

    expect(getDemoRoutes({ absTmpPath: path.join(process.cwd(), '.umi') })).toEqual([
      {
        path: '/_demos/demo',
        component: '../../packages/preset-dumi/src/routes/fixtures/demo/1/demo.tsx',
      },
      {
        path: '/_demos/demo-1',
        component: '../../packages/preset-dumi/src/routes/fixtures/demo/2/demo.tsx',
      },
    ]);
  });
});
