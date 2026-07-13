import { SP_ROUTE_PREFIX } from '@/constants';
import type { IApi } from '@/types';
import type { ExampleAsset } from 'dumi-assets-types';
import fs from 'fs';
import path from 'path';
import { lodash } from 'umi/plugin-utils';
import { getExampleAssets } from './assets';
import { UTOOPACK_DEMO_ASSETS_FILENAME } from './compile/utoopackLoaders';

const NO_PRERENDER_ROUTES = [
  // disable prerender for demo render page, because umi-hd doesn't support ssr
  // ref: https://github.com/umijs/dumi/pull/1451
  'demo-render',
];

function readExampleAssetsFile(filePath: string) {
  if (!fs.existsSync(filePath)) return [];

  return fs
    .readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .reduce<ExampleAsset[]>((acc, line) => {
      try {
        acc.push(JSON.parse(line));
      } catch {
        // ignore malformed records from interrupted builds
      }

      return acc;
    }, []);
}

export default (api: IApi) => {
  api.describe({
    key: 'dumi:exportStatic',
    enableBy: ({ env }) =>
      env === 'production' && api.isPluginEnable('exportStatic'),
  });

  // disable prerender for some routes, to avoid prerender error or hydration error
  api.modifyRoutes({
    // make sure be the last
    stage: Infinity,
    fn(memo) {
      NO_PRERENDER_ROUTES.forEach((id) => {
        if (memo[id]) memo[id].prerender = false;
      });

      return memo;
    },
  });

  // static /~demos/:id pages when exportStatic enabled
  api.modifyExportHTMLFiles({
    // make sure before umi exportStatic
    before: 'exportStatic',
    fn(memo) {
      // append demo routes to exportHtmlData
      // why not generate html content for each demo then push to memo?
      // because umi exportStatic will handle relative publicPath
      // so push routes to exportHtmlData to make it also work for demo routes
      const routePrefix = `${SP_ROUTE_PREFIX}demos`;
      const examples = lodash.uniqBy(
        [
          ...getExampleAssets(),
          ...readExampleAssetsFile(
            path.join(api.paths.absTmpPath, UTOOPACK_DEMO_ASSETS_FILENAME),
          ),
        ],
        'id',
      );
      const localeSuffixes = api.config.locales
        .map((locale) => ('suffix' in locale ? locale.suffix : ''))
        .filter(Boolean);
      const exampleIds = lodash.uniq(
        examples.flatMap(({ id }) => [
          id,
          ...localeSuffixes.map((suffix) =>
            id.endsWith(suffix) ? id : `${id}${suffix}`,
          ),
        ]),
      );

      api.appData.exportHtmlData.push(
        ...exampleIds.map((id) => ({
          route: { path: `/${routePrefix}/${id}` },
          file: `${routePrefix}/${id}/index.html`,
          prerender: false,
        })),
      );

      return memo;
    },
  });

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'dumi/exportStaticRuntimePlugin.ts',
      content: `
export function modifyClientRenderOpts(memo: any) {
  const { history, hydrate } = memo;

  return {
    ...memo,
    hydrate: hydrate && !history.location.pathname.startsWith('/${SP_ROUTE_PREFIX}demos'),
  };
}
      `.trim(),
      noPluginDir: true,
    });
  });

  api.addRuntimePlugin(() => {
    return [`@@/dumi/exportStaticRuntimePlugin.ts`];
  });
};
