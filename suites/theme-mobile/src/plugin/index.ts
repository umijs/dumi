import type { IApi } from 'dumi';
import { logger } from 'dumi/plugin-utils';

export default (api: IApi) => {
  api.describe({ key: `dumi-theme:${require('../../package.json').name}` });
  api.onStart(() => {
    logger.info('Using Dumi mobile theme');
  });
};
