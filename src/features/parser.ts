import type AtomAssetsParser from '@/assetParsers/atom';
import type { IApi } from '@/types';
import assert from 'assert';
import { ATOMS_META_PATH } from './meta';

export default (api: IApi) => {
  const writeAtomsMetaFile = (
    data: Awaited<ReturnType<AtomAssetsParser['parse']>>,
  ) => {
    api.writeTmpFile({
      noPluginDir: true,
      path: ATOMS_META_PATH,
      content: `export const components = ${JSON.stringify(
        data.components,
        null,
        2,
      )};`,
    });
  };

  api.describe({
    key: 'apiParser',
    enableBy: api.EnableBy.config,
    config: {
      schema: (Joi) => Joi.object(),
    },
  });

  // auto-detect default entry file
  api.modifyDefaultConfig((memo) => {
    // TODO: read entry from father config or support configured in config
    assert(
      api.userConfig.resolve?.entryFile,
      '`resolve.entryFile` must be configured when `apiParser` enable',
    );

    assert(
      api.pkg.devDependencies?.['typescript'],
      'typescript must be installed when `apiParser` enable',
    );

    return memo;
  });

  // share parser with other plugins via service
  api.onStart(async () => {
    const { default: AtomAssetsParser } = await import('@/assetParsers/atom');
    api.service.atomParser = new AtomAssetsParser({
      entryFile: api.config.resolve.entryFile!,
      resolveDir: api.cwd,
    });
    if (api.env === 'production') {
      api.service.atomParser.parse().then(writeAtomsMetaFile);
    } else {
      api.service.atomParser.watch(writeAtomsMetaFile);
    }
  });
};
