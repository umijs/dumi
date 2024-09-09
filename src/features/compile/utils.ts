import { logger } from '@umijs/utils';
import { isArray } from '@umijs/utils/compiled/lodash';
import { IApi } from 'umi';
export const shouldDisabledLiveDemo = (api: IApi) => {
  const extraBabelPlugins = api.userConfig.extraBabelPlugins;
  const disableFlag =
    isArray(extraBabelPlugins) &&
    extraBabelPlugins!.some((p: any) =>
      /^import$|babel-plugin-import/.test(p[0]),
    );
  if (disableFlag) {
    logger.warn(
      'live demo feature has been automatically disabled since babel-plugin-import be registered, if you want to enable live demo feature, checkout: https://d.umijs.org/guide/faq',
    );
  }
  return disableFlag;
};
