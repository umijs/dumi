import type { IApi } from 'umi';

const INTEGRATE_PLUGINS = ['@umijs/plugin-analytics'];

/**
 * plugin for integrate other umi plugins
 */
export default (api: IApi) => {
  // TODO: UMI4 api.hasPlugins \ api.service._extraPlugins is no support
  // const plugins = INTEGRATE_PLUGINS.filter(
  //   key =>
  //     !api.hasPlugins([key]) &&
  //     // search plugins of other presets
  //     api.service._extraPlugins.every(({ id }) => id !== key),
  // );

  // api.registerPlugins(plugins.map(key => require.resolve(key)));
};
