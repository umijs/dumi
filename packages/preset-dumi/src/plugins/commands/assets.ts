import fs from 'fs';
import path from 'path';
import type { IApi } from '@umijs/types';
import ctx from '../../context';
import getRouteConfig from '../../routes/getRouteConfig';
import type { AtomAsset } from '../../../../assets-types/typings';
import type AssetsPackage from '../../../../assets-types/typings';
import type { ExampleBlockAsset } from '../../../../assets-types/typings/example';

export default (api: IApi) => {
  const assetsPkg: AssetsPackage = {
    name: api.userConfig.title || api.pkg.name,
    package: api.pkg.name,
    logo: api.userConfig.logo,
    assets: {
      atoms: [],
      examples: [],
    },
  };

  /**
   * register dumi assets command
   */
  api.registerCommand({
    name: 'assets',
    async fn({ args }) {
      const assetsOutputPath = path.resolve(api.paths.cwd, (args._[0] || 'assets.json') as string);
      const fileName = path.parse(assetsOutputPath).base;

      api.logger.log(`Start to generate ${fileName}...`);
      await getRouteConfig(api, ctx.opts);

      const finalPkg: AssetsPackage = await api.applyPlugins({
        key: 'dumi.modifyAssetsMeta',
        type: api.ApplyPluginsType.modify,
        initialValue: assetsPkg,
      });

      // remove useless _sourcePath field in remark/meta.ts
      finalPkg.assets.atoms.forEach(atom => {
        // @ts-ignore
        delete atom._sourcePath;
      });

      fs.writeFileSync(assetsOutputPath, JSON.stringify(finalPkg, null, 2));
      api.logger.log(`Generate ${fileName} successfully!`);
    },
  });

  api.register({
    key: 'dumi.detectCodeBlock',
    fn(block: ExampleBlockAsset) {
      if (block.identifier) {
        const pos = assetsPkg.assets.examples.findIndex(b => b.identifier === block.identifier);

        if (pos > -1) {
          assetsPkg.assets.examples.splice(pos, 1, block);
        } else {
          assetsPkg.assets.examples.push(block);
        }
      }
    },
  });

  api.register({
    key: 'dumi.detectAtomAsset',
    fn(atom: AtomAsset) {
      const pos = assetsPkg.assets.atoms.findIndex(a => a.identifier === atom.identifier);

      if (pos > -1) {
        assetsPkg.assets.atoms.splice(pos, 1, atom);
      } else {
        assetsPkg.assets.atoms.push(atom);
      }
    },
  });
};
