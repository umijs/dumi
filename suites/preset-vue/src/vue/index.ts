import type { IApi } from 'dumi';
import registerTechStack from './techStack';
import modifyWebpackConfig from './webpack';

export default (api: IApi) => {
  api.describe({
    key: 'preset-vue:vue3',
  });

  modifyWebpackConfig(api);

  api.modifyDefaultConfig((config) => {
    // feature flags https://link.vuejs.org/feature-flags.
    config.define = {
      ...config.define,
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    };
    return config;
  });

  registerTechStack(api);
};
