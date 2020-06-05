import path from 'path';
import { IApi } from '@umijs/types';
import getRoutes from '../getRouteConfig';
import { init } from '../../context';

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
          absTmpPath: path.join(cwd, 'src/.umi'),
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
        component: '../../../examples/test.tsx',
        title: 'testing example frontmatter',
      },
      {
        path: '/',
        component: '../../../../../../themes/default/layout.js',
        routes: [
          {
            path: '/',
            component: '../../../examples/index.md',
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
            component: '../../../../../../themes/default/builtins/Example.js',
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
