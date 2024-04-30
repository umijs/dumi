import type { IApi } from 'umi';
export default (api: IApi) => {
  process.env.OKAM = require.resolve(
    require.resolve('/Users/xiaoxiao/work/mako/packages/bundler-okam/index'),
  );

  api.describe({
    key: 'okamHooks',
    enableBy: () => Boolean(process.env.OKAM),
  });
};
