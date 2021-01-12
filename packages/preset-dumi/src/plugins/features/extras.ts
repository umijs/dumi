import type { IApi } from '@umijs/types';

const INTEGRATE_PLUGINS = ['@umijs/plugin-analytics'];

/**
 * plugin for integrate other umi plugins
 */
export default (api: IApi) => {
  const plugins = INTEGRATE_PLUGINS.filter(
    key =>
      !api.hasPlugins([key]) &&
      // search plugins of other presets
      api.service._extraPlugins.every(({ id }) => id !== key),
  );

  api.registerPlugins(plugins.map(key => require.resolve(key)));
};
