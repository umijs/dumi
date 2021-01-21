import type { webpack } from '@umijs/types';
import path from 'path';

interface IOpts {
  sideEffects: string[];
  pkgPath: string;
}

/**
 * webpack plugin for add extra sideEffects item if user configured sideEffects in package.json
 */
export default class docSideEffectsWebpackPlugin {
  opts: IOpts;
  constructor(opts: IOpts) {
    this.opts = opts;
  }
  apply(compiler: webpack.Compiler) {
    compiler.hooks.normalModuleFactory.tap(this.constructor.name, normalModuleFactory => {
      normalModuleFactory.hooks.afterResolve.tap(this.constructor.name, data => {
        const descriptionFileData = data.resourceResolveData?.descriptionFileData;
        const sideEffectsFlag = descriptionFileData?.sideEffects;

        if (
          (sideEffectsFlag === false || Array.isArray(sideEffectsFlag)) &&
          path.normalize(data.resourceResolveData.descriptionFilePath) === this.opts.pkgPath
        ) {
          const list = new Set(sideEffectsFlag || []);

          this.opts.sideEffects.forEach(item => list.add(item));
          descriptionFileData.sideEffects = Array.from(list);
        }
      });
    });
  }
}
