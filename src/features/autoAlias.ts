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
    enableBy: () => !!api.pkg.name,
  });

  api.modifyConfig(async (memo) => {
    const fatherConfigs: any[] = await api.applyPlugins({
      key: 'dumi.modifyFatherConfigs',
      type: api.ApplyPluginsType.modify,
      initialValue: await tryFatherBuildConfigs(api.cwd),
    });

    // sort by output level, make sure the deepest output has the highest priority
    fatherConfigs.sort((a, b) => {
      const aLevel = (a.output?.path || a.output).split('/').length;
      const bLevel = (b.output?.path || b.output).split('/').length;

      return bLevel - aLevel;
    });

    // create subpaths alias for each input/entry
    fatherConfigs.forEach((item) => {
      memo.alias[`${api.pkg.name}/${item.output?.path || item.output}`] ??=
        path.join(api.cwd, item.entry || item.input);
    });

    let entryDir = '';

    if (memo.resolve?.entryFile) {
      entryDir = path.resolve(api.cwd, memo.resolve.entryFile);
    } else if (fs.existsSync(path.join(api.cwd, 'src'))) {
      entryDir = path.join(api.cwd, 'src');
    }

    // create pkg alias to entry dir, must behind subpaths alias from father configs
    if (entryDir) {
      memo.alias[api.pkg.name!] ??= entryDir;
    }

    return memo;
  });
};
