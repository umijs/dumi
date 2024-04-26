import { EnableBy } from '@umijs/core/dist/types';
import type { IApi } from 'dumi';
import './requireHook';

export default (api: IApi) => {
  api.describe({
    key: 'vue',
    config: {
      schema({ zod }) {
        return zod.object({
          directory: zod.string().optional(),
          tsconfigPath: zod.string().optional(),
          checkerOptions: zod.object({}).optional(),
          compiler: zod
            .object({
              babelStandaloneCDN: zod.string().optional(),
            })
            .optional(),
        });
      },
    },
    enableBy: EnableBy.config,
  });

  return {
    plugins: [require.resolve('./common'), require.resolve('./vue')],
  };
};
