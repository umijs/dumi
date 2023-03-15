import { SP_ROUTE_PREFIX } from '@/constants';
import type { IApi } from '@/types';
import { getExampleAssets } from './assets';

const NO_PRERENDER_ROUTES = [
  // to avoid hydration error for gh-pages
  // it cannot support `~` and will fall back demo single page to 404
  '404',
  // disable prerender for demo render page, because umi-hd doesn't support ssr
  // ref: https://github.com/umijs/dumi/pull/1451
  'demo-render',
];

export default (api: IApi) => {
  api.describe({ key: 'dumi:exportStatic' });

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
  api.modifyExportHTMLFiles((htmlFiles) => {
    const filePrefix = `${SP_ROUTE_PREFIX}demos`;
    const examples = getExampleAssets();
    const content = htmlFiles.find((file) =>
      file.path.startsWith(`${filePrefix}/:id/`),
    )!.content;

    htmlFiles.push(
      ...examples.map(({ id }) => ({
        path: `${filePrefix}/${id}/index.html`,
        content,
      })),
    );

    return htmlFiles;
  });
};
