import type { IApi } from 'father';
import fs from 'fs';
import path from 'path';

export default (api: IApi) => {
  const defaultConfig: IApi['userConfig'] = {
    // client files to esm
    esm: {
      output: 'dist',
      ignores: ['src/plugin/**', 'src/plugin.*'],
    },
    // keep slots imports like `dumi/theme/slots/xxx`
    // to override auto-alias from tsconfig.json paths
    alias: { 'dumi/theme': 'dumi/theme' },
  };

  if (fs.existsSync(path.join(api.cwd, 'src/plugin'))) {
    // node files to cjs
    defaultConfig.cjs = {
      output: 'dist',
      ignores: ['!src/plugin/**', '!src/plugin.*'],
    };
  }

  // modify default build config for dumi theme project
  api.modifyDefaultConfig((memo) => Object.assign(memo, defaultConfig));

  // register a prepare command for link theme to example
  api.registerCommand({
    name: 'link-dev-theme',
    fn() {
      const rltFrom = 'example/.dumi/theme';
      const from = path.join(api.cwd, rltFrom);
      const target = '../../src';

      if (!fs.existsSync(from)) {
        // ensure parent dir
        if (!fs.existsSync(path.dirname(from)))
          fs.mkdirSync(path.dirname(from), { recursive: true });

        // create symlink
        fs.symlinkSync(
          target,
          from,
          process.platform === 'win32' ? 'junction' : 'dir',
        );

        api.logger.info(`Created a symlink from ${rltFrom} to ${target}`);
      }
    },
  });
};
