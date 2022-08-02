import path from 'path';
import getRoute from '../getRouteConfigFromDir';
import decorateRoute from '../decorator';

const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures');

const DEFAULT_LOCALES = [
  ['en-US', 'EN'],
  ['zh-CN', '中文'],
];

describe('routes: redirect', () => {
  const rawRoutes = getRoute(path.join(FIXTURES_PATH, 'redirect'), {
    locales: DEFAULT_LOCALES,
  } as any);

  it('nav redirect according to user menu config', () => {
    const routes = decorateRoute(
      rawRoutes,
      {
        locales: DEFAULT_LOCALES,
        mode: 'site',
        menus: {
          '/nav1': [
            {
              children: ['nav1/b'],
            },
          ],
          '/nav2': [
            {
              children: [{ path: '/nav2/b' }],
            },
          ],
        },
        resolve: { includes: [] },
      } as any,
      {
        paths: {
          cwd: process.cwd(),
          absTmpPath: path.join(process.cwd(), 'src/.umi'),
        },
      } as any,
    );

    expect(routes.find(route => route.path === '/nav1').redirect).toEqual('/nav1/b');
    expect(routes.find(route => route.path === '/nav2').redirect).toEqual('/nav2/b');
  });

  it('menu redirect according to user menu config', () => {
    const routes = decorateRoute(
      rawRoutes,
      {
        locales: DEFAULT_LOCALES,
        mode: 'site',
        menus: {
          '/nav1': [
            {
              children: ['nav1/b'],
            },
            {
              path: '/nav1/nav4',
              children: ['nav1/nav4/a'],
            },
          ],
          '/nav2': [
            {
              children: [{ path: '/nav2/b' }],
            },
            {
              path: '/nav2/nav3',
              children: [
                {
                  path: '/nav2/nav3/a',
                },
                {
                  path: '/nav2/nav3/b',
                },
              ],
            },
          ],
        },
        resolve: { includes: [] },
      } as any,
      {
        paths: {
          cwd: process.cwd(),
          absTmpPath: path.join(process.cwd(), 'src/.umi'),
        },
      } as any,
    );

    expect(routes.find(route => route.path === '/nav2/nav3').redirect).toEqual('/nav2/nav3/a');
    expect(routes.find(route => route.path === '/nav1/nav4').redirect).toEqual('/nav1/nav4/a');
  });
});
