import type { IApi } from 'dumi';
import { createVueAtomAssetsParser, type VueParserOptions } from './atomParser';

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

  api.modifyConfig((memo) => {
    const userConfig = api.userConfig;

    const vueConfig = userConfig?.vue;
    const parserOptions: Partial<VueParserOptions> =
      vueConfig?.parserOptions || {};

    const entryFile = userConfig?.resolve?.entryFile;
    const resolveDir = api.cwd;

    const options = {
      entryFile,
      resolveDir,
    };
    Object.assign(options, parserOptions);

    if (!options.entryFile || !options.resolveDir) return memo;

    api.service.atomParser = createVueAtomAssetsParser(
      options as VueParserOptions,
    );
    return memo;
  });
};
