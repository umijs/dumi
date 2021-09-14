import path from 'path';
import type { IApi } from '@umijs/types';
import getRoutes from '../getRouteConfig';
import type { IDumiOpts } from '../../context';
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
        applyPlugins: (() => ({
          layoutPaths: { _: '' },
          builtins: [{ identifier: 'Example', modulePath: '' }],
          fallbacks: [],
        })) as any,
      } as IApi,
      {} as IDumiOpts,
    );
  });

  afterAll(() => {
    init({} as IApi, {} as IDumiOpts);
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
        ApplyPluginsType: {},
        applyPlugins: ({ initialValue }) => initialValue,
        userConfig: {},
      } as IApi,
      {
        locales: [['en-US', 'EN']],
        resolve: {
          examples: ['examples'],
          includes: [],
        },
      } as IDumiOpts,
    );

    expect(routes.find(route => route.path === '/_examples/test')).not.toBeUndefined();
  });
});
