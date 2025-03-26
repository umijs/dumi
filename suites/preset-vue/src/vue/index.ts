import type { IApi } from 'dumi';
import checkVersion from './checkVersion';
import registerTechStack from './techStack';
import modifyWebpackConfig from './webpack';

export default (api: IApi) => {
  api.describe({
    key: 'preset-vue', // dont add `:`, if use `api.writeTmpFile` in plugin
  });

  checkVersion(api);

  modifyWebpackConfig(api);

  api.modifyDefaultConfig((config) => {
    // feature flags https://link.vuejs.org/feature-flags.
    config.define = {
      ...config.define,
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false, // vue3.4
    };
    return config;
  });

  registerTechStack(api);
};
