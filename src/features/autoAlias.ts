import type { IApi } from '@/types';
import { tryFatherBuildConfigs } from '@/utils';
import fs from 'fs';
import path from 'path';

export default (api: IApi) => {
  let entryDir: string;

  api.describe({
    key: 'autoAlias',
    config: {
      schema: (Joi) => Joi.bool(),
    },
    enableBy: () => !!api.pkg.name,
  });

  api.modifyAppData(async (memo) => {
    if (api.config.resolve?.entryFile) {
      entryDir = path.resolve(api.cwd, api.config.resolve.entryFile);
    } else if (fs.existsSync(path.join(api.cwd, 'src'))) {
      entryDir = path.join(api.cwd, 'src');
    }

    // save father configs to appData, allow other plugins to modify
    memo.fatherConfigs = await tryFatherBuildConfigs(api.cwd);

    return memo;
  });

  api.chainWebpack((memo) => {
    const fatherConfigs = api.appData.fatherConfigs as any[];

    // sort by output level, make sure the deepest output has the highest priority
    fatherConfigs.sort((a, b) => {
      const aLevel = (a.output?.path || a.output).split('/').length;
      const bLevel = (b.output?.path || b.output).split('/').length;

      return bLevel - aLevel;
    });

    // create subpaths alias for each input/entry
    fatherConfigs.forEach((item) => {
      const key = `${api.pkg.name}/${item.output?.path || item.output}`;

      if (!memo.resolve.alias.has(key)) {
        memo.resolve.alias.set(
          key,
          path.join(api.cwd, item.entry || item.input),
        );
      }
    });

    // create pkg alias to entry dir
    if (entryDir && !memo.resolve.alias.has(api.pkg.name!)) {
      memo.resolve.alias.set(api.pkg.name!, entryDir);
    }

    return memo;
  });
};
