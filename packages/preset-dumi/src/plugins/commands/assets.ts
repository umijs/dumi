import fs from 'fs';
import path from 'path';
import { IApi } from '@umijs/types';
import ctx from '../../context';
import getRouteConfig from '../../routes/getRouteConfig';
import AssetsPackage, { AtomAsset } from '../../../../assets-types/typings';
import { ExampleBlockAsset } from '../../../../assets-types/typings/example';

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
    fn({ args }) {
      const assetsOutputPath = path.resolve(api.paths.cwd, args._[0] || 'assets.json');
      const fileName = path.parse(assetsOutputPath).base;

      api.logger.log(`Start to generate ${fileName}...`);

      getRouteConfig(api, ctx.opts);
      fs.writeFileSync(assetsOutputPath, JSON.stringify(assetsPkg, null, 2));

      api.logger.log(`Generate ${fileName} successfully!`);
    },
  });

  api.register({
    key: 'dumi.detectCodeBlock',
    fn(block: ExampleBlockAsset) {
      if (block.name || block.uuid) {
        assetsPkg.assets.examples.push(block);
      }
    },
  });

  api.register({
    key: 'dumi.detectAtomAsset',
    fn(atom: AtomAsset) {
      assetsPkg.assets.atoms.push(atom);
    },
  });
};
