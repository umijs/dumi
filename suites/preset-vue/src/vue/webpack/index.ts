import type Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import type { IApi } from 'dumi';
import { getConfig } from './config';

export default function (api: IApi) {
  api.modifyConfig((memo) => {
    const enableMFSU = memo.mfsu !== false;
    if (enableMFSU) {
      const msfuConfig = memo.mfsu || {};
      memo.mfsu = {
        ...msfuConfig,
        shared: {
          ...msfuConfig.shared,
          vue: { singleton: true },
        },
        chainWebpack(config: Config) {
          getConfig(config, api);
          return config;
        },
      };
    }
    return memo;
  });

  api.chainWebpack((memo) => {
    getConfig(memo, api);
  });
}
