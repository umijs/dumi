import { SP_ROUTE_PREFIX } from '@/constants';
import type { IApi } from '@/types';
import { getExampleAssets } from './assets';

export default (api: IApi) => {
  api.describe({ key: 'dumi:exportStatic' });

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
