import { SP_ROUTE_PREFIX } from '@/constants';
import type { IApi } from '@/types';
import { getExampleAssets } from './assets';

export default (api: IApi) => {
  api.describe({ key: 'dumi:exportStatic' });

  // static /~demos/:id pages when exportStatic enabled
  api.register({
    key: 'modifyConfig',
    stage: Infinity,
    fn(memo: IApi['config']) {
      if (api.userConfig.exportStatic !== false) {
        const prev = memo.exportStatic?.extraRoutePaths || [];

        memo.exportStatic ??= {};
        memo.exportStatic.extraRoutePaths = async () => {
          const examples = getExampleAssets();
          const userExtraPaths =
            typeof prev === 'function' ? await prev() : prev;

          return userExtraPaths.concat(
            examples.map(({ id }) => `/${SP_ROUTE_PREFIX}demos/${id}`),
          );
        };
      }

      return memo;
    },
  });
};
