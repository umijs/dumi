import { SP_ROUTE_PREFIX } from '@/constants';
import type { IApi } from '@/types';
import { semver } from 'umi/plugin-utils';
import { getExampleAssets } from './assets';

export default (api: IApi) => {
  const prevExtraRoutePaths: NonNullable<
    IApi['config']['exportStatic']
  >['extraRoutePaths'][] = [];

  api.describe({ key: 'dumi:exportStatic' });

  // save extraRoutePaths from default config, will merge theme later
  api.register({
    key: 'modifyDefaultConfig',
    stage: Infinity,
    fn(memo: IApi['config']) {
      if (memo.exportStatic && memo.exportStatic.extraRoutePaths) {
        prevExtraRoutePaths.push(memo.exportStatic.extraRoutePaths);
      }
    },
  });

  // static /~demos/:id pages when exportStatic enabled
  api.register({
    key: 'modifyConfig',
    stage: Infinity,
    fn(memo: IApi['config']) {
      // @ts-ignore
      if (memo.exportStatic !== false) {
        // save extraRoutePaths from config, will merge theme later
        if (memo.exportStatic?.extraRoutePaths) {
          prevExtraRoutePaths.push(memo.exportStatic.extraRoutePaths);
        }

        memo.exportStatic ??= {};
        memo.exportStatic.extraRoutePaths = async () => {
          const examples = getExampleAssets();
          const userExtraPaths: (
            | string
            | { path: string; prerender: boolean }
          )[] = [];
          // Umi support disable prerender since 4.0.48
          const isSupportDisablePrerender = semver.gte(
            api.appData.umi.version,
            '4.0.48',
          );

          // merge all extraRoutePaths from default config & config
          for (const prev of prevExtraRoutePaths) {
            userExtraPaths.push(
              ...(typeof prev === 'function' ? await prev() : prev),
            );
          }

          return userExtraPaths.concat(
            examples.map(({ id }) => {
              const demoPath = `/${SP_ROUTE_PREFIX}demos/${id}`;

              return isSupportDisablePrerender
                ? { path: demoPath, prerender: false }
                : demoPath;
            }),
          );
        };
      }

      return memo;
    },
  });
};
