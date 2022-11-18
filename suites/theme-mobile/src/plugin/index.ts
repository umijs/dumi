import type { IApi } from 'dumi';
import { logger } from 'dumi/plugin-utils';

export default (api: IApi) => {
  api.describe({ key: `dumi-theme:${require('../../package.json').name}` });
  api.onStart(() => {
    logger.info('Using Dumi mobile theme');
  });
  api.modifyRoutes((routes) => {
    // append gallery render page
    routes['gallery'] = {
      id: 'gallery',
      path: `/gallery`,
      absPath: `/gallery`,
      parentId: 'dumi-context-layout',
      file: require.resolve(`../gallery/index`),
    };

    return routes;
  });
};
