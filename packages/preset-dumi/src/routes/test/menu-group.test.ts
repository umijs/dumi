import path from 'path';
import getMenu from '../getMenuFromRoutes';
import getRoute from '../getRouteConfigFromDir';
import decorateRoute from '../decorator';

const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures');

const DEFAULT_LOCALES = [
  ['en-US', 'EN'],
  ['zh-CN', '中文'],
];

describe('routes: menu group', () => {
  const opts = {
    locales: DEFAULT_LOCALES,
    resolve: { includes: [] },
    mode: 'site',
  } as any;
  const umi = {
    paths: {
      cwd: process.cwd(),
      absTmpPath: path.join(process.cwd(), 'src/.umi'),
    },
  } as any;
  const rawRoutes = getRoute(path.join(FIXTURES_PATH, 'menu-group'), opts);

  it('generate correct site menus', () => {
    const routes = decorateRoute(rawRoutes, opts, umi);
    const menus = getMenu(routes, opts, umi);

    expect(menus).toEqual({
      'en-US': {
        '*': [
          {
            path: '/',
            title: 'Index',
            meta: {},
          },
        ],
        '/legacy-merge': [
          {
            title: 'Input',
            meta: {
              __fallback: true,
            },
            children: [],
            path: '/legacy-merge/input',
          },
        ],
        '/non-link-group': [
          {
            title: 'No Link',
            meta: {
              __fallback: true,
            },
            children: [
              {
                path: '/non-link-group/a',
                title: 'A',
                meta: {},
              },
              {
                path: '/non-link-group/b',
                title: 'B',
                meta: {},
              },
            ],
          },
        ],
        '/single-child': [
          {
            title: 'Single',
            meta: {
              __fallback: true,
            },
            children: [
              {
                path: '/single-child/button',
                title: 'Button',
                meta: {},
              },
            ],
          },
        ],
      },
    });
  });
});
