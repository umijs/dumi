import path from 'path';
import { IApi } from '@umijs/types';
import getRoutes from '../getRouteConfig';
import { init } from '../../context';
import getAbsolutePath from '../../utils/getAbsolutePath';

const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures');

describe('routes: examples', () => {
  const cwd = path.join(FIXTURES_PATH, 'examples');

  beforeAll(() => {
    init({ cwd, paths: { cwd } } as IApi, {});
  });

  afterAll(() => {
    init({} as IApi, {});
  });

  it('getExampleRoutes', () => {
    const routes = getRoutes(
      {
        paths: {
          cwd,
          absPagesPath: path.join(cwd, 'src/pages'),
        },
      } as IApi,
      {
        locales: [],
        resolve: {
          examples: ['examples'],
          includes: [],
        },
      },
    );

    expect(routes).toEqual([
      {
        path: '/_examples/test',
        component: getAbsolutePath(
          './packages/preset-dumi/src/routes/fixtures/examples/examples/test.tsx',
        ),
        title: 'testing example frontmatter',
      },
      {
        path: '/',
        component: getAbsolutePath('./packages/preset-dumi/src/themes/default/layout.js'),
        routes: [
          {
            path: '/',
            component: getAbsolutePath(
              './packages/preset-dumi/src/routes/fixtures/examples/examples/index.md',
            ),
            exact: true,
            meta: {
              filePath: 'examples/index.md',
              updatedTime: 1588917390000,
              slugs: [],
              title: 'Index',
            },
            title: 'Index',
          },
          {
            path: '/test',
            component: getAbsolutePath(
              './packages/preset-dumi/src/themes/default/builtins/Example.js',
            ),
            exact: true,
            meta: {
              title: 'testing example frontmatter',
              example: true,
              examplePath: '/_examples/test',
            },
            title: 'testing example frontmatter',
          },
        ],
        title: undefined,
      },
    ]);
  });
});
