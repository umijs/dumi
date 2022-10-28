import type { IApi } from 'father';
import fs from 'fs';
import path from 'path';

export default (api: IApi) => {
  const defaultConfig: IApi['userConfig'] = {
    // client files to esm
    esm: {
      output: 'dist',
      ignores: ['src/plugin', 'src/plugin.*'],
    },
  };

  if (fs.existsSync(path.join(api.cwd, 'src/plugin'))) {
    // node files to cjs
    defaultConfig.cjs = {
      output: 'dist',
      ignores: ['!src/plugin', '!src/plugin.*'],
    };
  }

  // modify default build config for dumi theme project
  api.modifyDefaultConfig((memo) => Object.assign(memo, defaultConfig));
};
