import { Env } from '@umijs/core';
import { join } from 'path';
import { Service } from 'umi';
import { winPath } from 'umi/plugin-utils';
import { DEFAULT_CONFIG_FILES, FRAMEWORK_NAME } from './constants';

function winJoin(...args: string[]) {
  return winPath(join(...args));
}

export class DumiService extends Service {
  constructor() {
    super({
      defaultConfigFiles: DEFAULT_CONFIG_FILES,
      frameworkName: FRAMEWORK_NAME,
    });
  }

  async getPaths() {
    const { cwd } = this;
    const tmp = this.env === Env.development ? `tmp` : `tmp-${this.env}`;
    const absFWPath = winJoin(cwd, `.${FRAMEWORK_NAME}`);

    // use .dumi as src dir for move all conventional files to .dumi
    // such as app.ts, global.ts, loading.tsx & etc.
    const absSrcPath = absFWPath;
    const absPagesPath = winJoin(absSrcPath, 'pages');
    const absApiRoutesPath = winJoin(absSrcPath, 'api');
    const absTmpPath = winJoin(absSrcPath, tmp);
    const absNodeModulesPath = winJoin(cwd, 'node_modules');
    const absOutputPath = winJoin(cwd, 'dist');

    return {
      cwd,
      absSrcPath,
      absPagesPath,
      absApiRoutesPath,
      absTmpPath,
      absNodeModulesPath,
      absOutputPath,
    };
  }
}
