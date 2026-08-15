import type { IApi } from 'dumi';
import { VueApiParser, type VueParserOptions } from './atomParser';

export default (api: IApi) => {
  api.describe({
    key: 'preset-vue:common',
  });

  api.modifyBabelPresetOpts((memo) => {
    memo.presetTypeScript = {
      allExtensions: true,
      isTSX: true,
    };
    return memo;
  });

  // Create the Vue atom parser only for commands that actually need it (dev/build).
  // `onCheckPkgJSON` is NOT triggered by the `setup` command, so the parser's
  // worker_threads Worker is never spawned during `dumi setup`; previously it was
  // created in `modifyConfig` (which runs for every command) and never terminated,
  // keeping the process alive and hanging on "generate files" (#2283).
  // Lowest stage so this runs before dumi core's apiParser feature, which skips
  // creating its React parser when `api.service.atomParser` is already a
  // BaseAtomAssetsParser.
  api.onCheckPkgJSON({
    stage: -Infinity,
    fn() {
      const vueConfig = api.userConfig?.vue;

      const parserOptions: Partial<VueParserOptions> = {
        directory: vueConfig?.directory ?? api.pkg.repository?.directory,
        tsconfigPath: vueConfig?.tsconfigPath,
        checkerOptions: vueConfig?.checkerOptions,
      };

      const entryFile = api.userConfig?.resolve?.entryFile;
      const resolveDir = api.cwd;
      const options = {
        entryFile,
        resolveDir,
      };
      Object.assign(options, parserOptions);

      if (!options.entryFile || !options.resolveDir) return;

      api.service.atomParser = VueApiParser(options as VueParserOptions);
    },
  });
};
