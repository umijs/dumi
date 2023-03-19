import { SP_ROUTE_PREFIX } from '@/constants';
import type { IApi } from '@/types';
import { getExampleAssets } from './assets';

const NO_PRERENDER_ROUTES = [
  // disable prerender for demo render page, because umi-hd doesn't support ssr
  // ref: https://github.com/umijs/dumi/pull/1451
  'demo-render',
];

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
      const examples = getExampleAssets();

      api.appData.exportHtmlData.push(
        ...examples.map(({ id }) => ({
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
