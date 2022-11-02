import type { IApi } from '@/types';
import { tryFatherBuildConfigs } from '@/utils';
import fs from 'fs';
import path from 'path';

export default (api: IApi) => {
  api.describe({
    key: 'autoAlias',
    config: {
      schema: (Joi) => Joi.bool(),
    },
    enableBy: ({ userConfig }) => userConfig.autoAlias !== false,
  });

  api.modifyDefaultConfig(async (memo) => {
    let entryDir = '';

    if (api.userConfig.resolve?.entryFile) {
      entryDir = path.resolve(api.cwd, api.userConfig.resolve.entryFile);
    } else if (fs.existsSync(path.join(api.cwd, 'src'))) {
      entryDir = path.join(api.cwd, 'src');
    }

    if (entryDir && api.pkg.name) {
      const fatherConfigs = await tryFatherBuildConfigs(api.cwd);

      // sort by output level, make sure the deepest output has the highest priority
      fatherConfigs.sort((a, b) => {
        const aLevel = (a.output?.path || a.output).split('/').length;
        const bLevel = (b.output?.path || b.output).split('/').length;

        return bLevel - aLevel;
      });

      // create subpaths alias for each input/entry
      fatherConfigs.forEach((item) => {
        memo.alias[`${api.pkg.name}/${item.output?.path || item.output}`] =
          path.join(api.cwd, item.entry || item.input);
      });

      // create pkg alias to entry dir
      memo.alias[api.pkg.name] = entryDir;
    }

    return memo;
  });
};
