import type { IApi } from 'dumi';
import type { VueParserOptions } from './atomParser';

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

  // Initialize before core's React parser fallback in dev/build.
  // setup does not run this hook and must not load the worker-owning module.
  api.onCheckPkgJSON({
    stage: -Infinity,
    fn() {
      // Package changes trigger this hook again during dev. Keep the parser
      // that already owns the worker and its watch callbacks.
      if (api.service.atomParser) return;

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

      // Loading atomParser calls createApiParser and starts its worker.
      // Defer the module itself as well as the parser instance until dev/build.
      const {
        VueApiParser,
      }: typeof import('./atomParser') = require('./atomParser');
      api.service.atomParser = VueApiParser(options as VueParserOptions);
    },
  });
};
