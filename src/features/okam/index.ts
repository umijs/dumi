import type { IApi } from 'umi';
// import { runLoaders } from '../../../compiled/loader-runner';
// import fs from 'fs'
export default (api: IApi) => {
  process.env.OKAM = require.resolve(
    require.resolve('/Users/xiaoxiao/work/mako/packages/bundler-okam/index'),
  );
  // const mdLoaderPath = require.resolve('../../loaders/markdown');

  api.describe({
    key: 'okamHooks',
    // enableBy: () => Boolean(process.env.OKAM),
  });
};
