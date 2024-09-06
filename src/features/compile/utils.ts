import { isArray } from '@umijs/utils/compiled/lodash';
import { IApi } from 'umi';

export const shouldDisabledLiveDemo = (api: IApi) => {
  const extraBabelPlugins = api.userConfig.extraBabelPlugins;
  const disableFlag =
    isArray(extraBabelPlugins) &&
    extraBabelPlugins?.some((p: any) =>
      /^import$|babel-plugin-import/.test(p[0]),
    );
  if (disableFlag) {
    api.logger.warn(
      "dumi don't suggest to use babel-plugin-import, liveDemo will be disabled because of this config.",
    );
  }
  return disableFlag;
};
