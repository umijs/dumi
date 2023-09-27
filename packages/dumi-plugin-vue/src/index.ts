import type { IApi } from 'dumi';
import genRuntimeApi from './genRuntimeApi';
import './requireHook';
import registerTechStack from './techStack';
import modifyWebpackConfig from './webpack';

const PLUGIN_KEY = 'dumi:vue';

export default (api: IApi) => {
  api.describe({
    key: PLUGIN_KEY,
    config: {
      schema(joi) {
        return joi.object({
          globalInject: joi
            .object({
              imports: joi.string().optional(),
              statements: joi.string().optional(),
            })
            .optional(),
        });
      },
    },
  });

  api.modifyBabelPresetOpts((memo) => {
    memo.presetTypeScript = {
      allExtensions: true,
      isTSX: true,
    };
    return memo;
  });

  modifyWebpackConfig(api);

  api.modifyConfig((memo) => {
    memo.babelLoaderCustomize = require.resolve('./vueBabelLoaderCustomize');
    memo.resolveDemoModule = {
      '.vue': { loader: 'tsx', transform: 'html' },
    };
    return memo;
  });

  api.modifyDefaultConfig((config) => {
    // feature flags https://link.vuejs.org/feature-flags.
    config.define = {
      ...config.define,
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    };
    return config;
  });

  genRuntimeApi(api);

  registerTechStack(api);
};
