import type { IApi } from '@umijs/types';
import ctx from '../../context';

/**
 * plugin for disable all dumi plugins
 */
export default (api: IApi) => {
  // disable dumi in interate mode and non-development mode
  const isDisableDumi = ctx.opts.isIntegrate && api.env !== 'development';

  if (isDisableDumi) {
    const dumiPlugins = Object.values(api.service.plugins)
      .filter(({ id }) => /preset-dumi\/(lib|src)\/plugins/.test(id))
      .map(({ id }) => id);

    api.skipPlugins(dumiPlugins);
  }
};
