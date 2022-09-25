import path from 'path';
import type { webpack } from 'umi';

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
    compiler.hooks.normalModuleFactory.tap(
      this.constructor.name,
      (normalModuleFactory) => {
        normalModuleFactory.hooks.afterResolve.tap(
          this.constructor.name,
          (data) => {
            // compatible with webpack5 (data.createData) & webpack4 (data)
            const createData = data.createData || data;
            const resourceResolveData = createData.resourceResolveData;
            const sideEffectsFlag =
              resourceResolveData?.descriptionFileData?.sideEffects;

            if (
              resourceResolveData &&
              (sideEffectsFlag === false || Array.isArray(sideEffectsFlag)) &&
              path.normalize(resourceResolveData.descriptionFilePath) ===
                this.opts.pkgPath
            ) {
              const list = new Set(sideEffectsFlag || []);

              this.opts.sideEffects.forEach((item) => list.add(item));

              resourceResolveData.descriptionFileData.sideEffects =
                Array.from(list);
            }
          },
        );
      },
    );
  }
}
