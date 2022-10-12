import type { IApi } from '@/types';
import type { AssetsPackage, ExampleAsset } from 'dumi-assets-types';
import fs from 'fs';
import path from 'path';
import { lodash } from 'umi/plugin-utils';

const examples: ExampleAsset[] = [];

/**
 * internal function to add example assets
 */
export function addExampleAssets(data: typeof examples) {
  examples.push(...data);
}

/**
 * plugin for generate assets.json
 */
export default (api: IApi) => {
  api.describe({
    config: {
      schema: (Joi) => Joi.object(),
    },
    enableBy: ({ env }) => env === 'production' && Boolean(api.args.assets),
  });

  api.onBuildComplete(async () => {
    // TODO: extra meta data from frontmatter
    const { components } = await api.service.atomParser.parse();
    const assets = await api.applyPlugins({
      key: 'modifyAssetsMetadata',
      initialValue: {
        name: api.config.themeConfig.title || api.pkg.name,
        npmPackageName: api.pkg.name,
        version: api.pkg.version,
        description: api.pkg.description,
        logo: api.config.themeConfig.logo,
        homepage: api.pkg.homepage,
        repository: api.pkg.repository,
        assets: {
          atoms: Object.values(components),
          examples: lodash.uniqBy(examples, 'id'),
        },
      } as AssetsPackage,
    });

    fs.writeFileSync(
      path.join(api.cwd, 'assets.json'),
      JSON.stringify(assets, null, 2),
      'utf-8',
    );
  });
};
