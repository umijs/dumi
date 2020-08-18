import path from 'path';
import { IApi } from '@umijs/types';
import getRoutes from '../getRouteConfig';
import { init } from '../../context';

const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures');

describe('routes: examples', () => {
  const cwd = path.join(FIXTURES_PATH, 'examples');

  beforeAll(() => {
    init(
      {
        cwd,
        paths: { cwd, absNodeModulesPath: cwd },
        ApplyPluginsType: {},
        applyPlugins: (() => ({ layoutPath: '', contentPath: '' })) as any,
      } as IApi,
      {},
    );
  });

  afterAll(() => {
    init({} as IApi, {});
  });

  it('getExampleRoutes', async () => {
    const routes = await getRoutes(
      {
        paths: {
          cwd,
          absTmpPath: path.join(cwd, 'src', '.umi'),
          absPagesPath: path.join(cwd, 'pages'),
          absNodeModulesPath: path.join(cwd, 'node_modules'),
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

    expect(routes.find(route => route.path == '/_examples/test')).not.toBeUndefined();
  });
});
