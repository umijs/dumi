import { EnableBy } from '@umijs/core/dist/types';
import type { IApi } from 'dumi';
import './requireHook';

export default (api: IApi) => {
  api.describe({
    key: 'vue',
    config: {
      schema({ zod }) {
        return zod.object({
          parserOptions: zod
            .object({
              tsconfigPath: zod.string().optional(),
              checkerOptions: zod.object({}).optional(),
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
