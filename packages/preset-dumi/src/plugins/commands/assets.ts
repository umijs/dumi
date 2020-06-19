import fs from 'fs';
import path from 'path';
import { IApi } from '@umijs/types';
import ctx from '../../context';
import getRouteConfig from '../../routes/getRouteConfig';
import AssetsPackage from '../../../../assets-types/typings';
import { ExampleBlockAsset } from '../../../../assets-types/typings/example';

export default (api: IApi) => {
  const isAssetCmd = process.argv[process.argv.length - 1] === 'assets';
  const assetsPkg: AssetsPackage = {
    name: api.userConfig.title || api.pkg.name,
    package: api.pkg.name,
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
    fn() {
      const assetsOutputPath = path.join(api.paths.absOutputPath, 'assets.json');

      api.logger.log('Start to generate assets.json...');

      getRouteConfig(api, ctx.opts);
      fs.writeFileSync(assetsOutputPath, JSON.stringify(assetsPkg, null, 2));

      api.logger.log('Generate assets.json successfully!');
    },
  });

  if (isAssetCmd) {
    api.register({
      key: 'dumi.detectCodeBlock',
      fn(block: ExampleBlockAsset) {
        assetsPkg.assets.examples.push(block);
      },
    });
  }
};
