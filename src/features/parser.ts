import type AtomAssetsParser from '@/assetParsers/atom';
import type { IApi } from '@/types';
import { lodash } from '@umijs/utils';
import assert from 'assert';
import { ATOMS_META_PATH } from './meta';

type IParsedAtomAssets = Awaited<ReturnType<AtomAssetsParser['parse']>>;

function filterIgnoredProps(
  props: IParsedAtomAssets['components'][string]['propsConfig']['properties'],
) {
  return lodash.pickBy(props, (prop) => {
    let isHidden = false;

    if (prop.type === 'array' && 'items' in prop) {
      prop.items = filterIgnoredProps({ _: prop.items! })._;
    } else if (prop.type === 'object' && 'properties' in prop) {
      prop.properties = filterIgnoredProps(prop.properties!);
    } else if (prop.oneOf) {
      // oneOf may be [null] with unknown reason
      prop.oneOf = prop.oneOf
        .filter(Boolean)
        .map((item) => filterIgnoredProps({ _: item })._);
    } else if (prop.allOf) {
      // allOf may be [null] with unknown reason
      prop.allOf = prop.allOf
        .filter(Boolean)
        .map((item) => filterIgnoredProps({ _: item })._);
    } else if ('hidden' in prop) {
      isHidden = true;
    }

    return !isHidden;
  });
}

export default (api: IApi) => {
  let prevData: IParsedAtomAssets;
  const writeAtomsMetaFile = (data: typeof prevData) => {
    // filter ignored properties
    const components = lodash.mapValues(data.components, (component) => ({
      ...component,
      propsConfig: filterIgnoredProps({ _: component.propsConfig })._,
    }));

    api.writeTmpFile({
      noPluginDir: true,
      path: ATOMS_META_PATH,
      content: `export const components = ${JSON.stringify(
        components,
        null,
        2,
      )};`,
    });
  };

  api.describe({
    key: 'apiParser',
    enableBy: api.EnableBy.config,
    config: {
      schema: (Joi) =>
        Joi.object({
          unpkgHost: Joi.string().uri().optional(),
          resolveFilter: Joi.function().optional(),
          parseOptions: Joi.object().optional(),
        }),
    },
  });

  // auto-detect default entry file
  api.modifyDefaultConfig((memo) => {
    // TODO: read entry from father config or support configured in config
    assert(
      api.userConfig.resolve?.entryFile,
      '`resolve.entryFile` must be configured when `apiParser` enable',
    );

    return memo;
  });

  // share parser with other plugins via service
  // why use `onCheckPkgJSON` instead of `onStart`?
  // because `onStart` will be called before any commands
  // and `onCheckPkgJson` only be called in dev and build
  api.onCheckPkgJSON(async () => {
    const {
      default: AtomAssetsParser,
    }: typeof import('@/assetParsers/atom') = require('@/assetParsers/atom');

    api.service.atomParser = new AtomAssetsParser({
      entryFile: api.config.resolve.entryFile!,
      resolveDir: api.cwd,
      unpkgHost: api.config.apiParser!.unpkgHost,
      resolveFilter: api.config.apiParser!.resolveFilter,
      parseOptions: api.config.apiParser!.parseOptions,
    });
  });

  // lazy parse & use watch mode in dev compiling
  api.onDevCompileDone(({ isFirstCompile }) => {
    if (isFirstCompile) {
      api.service.atomParser.watch((data) => {
        prevData = data;
        writeAtomsMetaFile(prevData);
      });
    }
  });

  api.onGenerateFiles(async () => {
    if (api.env === 'production') {
      // sync parse in production
      writeAtomsMetaFile(await api.service.atomParser.parse());
    } else if (prevData) {
      // also write prev data when re-generate files in development
      writeAtomsMetaFile(prevData);
    }
  });

  // destroy parser worker after build complete
  api.onBuildComplete({
    stage: Infinity,
    fn() {
      api.service.atomParser.destroyWorker();
    },
  });

  // update unavailable locale text for API component
  api.modifyTheme((memo) => {
    const parserOffKey = 'api.component.unavailable';
    const parserOnKey = 'api.component.loading';

    // use loading key as normal unavailable key when apiParser enabled
    Object.keys(memo.locales).forEach((locale) => {
      if (memo.locales[locale][parserOnKey]) {
        memo.locales[locale][parserOffKey] = memo.locales[locale][parserOnKey];
      }
    });

    return memo;
  });
};
