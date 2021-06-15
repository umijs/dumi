import fs from 'fs';
import path from 'path';
import type { IApi } from '@umijs/types';
import getHostPkgAlias from '../../utils/getHostPkgAlias';
import symlink from '../../utils/symlink';

/**
 * plugin for create node_modules symlink & webpack alias for local packages
 */
export default (api: IApi) => {
  const hostPkgAlias = getHostPkgAlias(api.paths).filter(([pkgName]) => pkgName);

  // create symlink for packages
  hostPkgAlias.forEach(([pkgName, pkgPath]) => {
    const linkPath = path.join(api.paths.cwd, 'node_modules', pkgName);

    // link current pkgs into node_modules, for module resolve in editor
    if (
      !fs.existsSync(linkPath) ||
      (
        fs.lstatSync(linkPath).isSymbolicLink() &&
        path.resolve(path.dirname(linkPath), fs.readlinkSync(linkPath)) !== pkgPath
      )
    ) {
      api.utils.rimraf.sync(linkPath);
      symlink(pkgPath, linkPath);
    }
  });

  // create webpack alias to src directory for packages
  api.chainWebpack(config => {
    hostPkgAlias.forEach(([pkgName, pkgPath]) => {
      let srcModule: any;
      const srcPath = path.join(pkgPath, 'src');

      try {
        srcModule = require(srcPath);
      } catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') {
          srcModule = true;
        }
      }

      // use src path instead of main field in package.json if exists
      if (srcModule) {
        // exclude es & lib folder
        if (!config.resolve.alias.has(`${pkgName}/es`)) {
          config.resolve.alias.set(`${pkgName}/es`, srcPath);
        }

        if (!config.resolve.alias.has(`${pkgName}/lib`)) {
          config.resolve.alias.set(`${pkgName}/lib`, srcPath);
        }

        if (!config.resolve.alias.has(pkgName)) {
          config.resolve.alias.set(`${pkgName}/src`, srcPath);
          config.resolve.alias.set(pkgName, srcPath);
        }
      } else if (!config.resolve.alias.has(pkgName)) {
        config.resolve.alias.set(pkgName, pkgPath);
      }
    });

    // set to umi to be able to use @umijs/preset-dumi alone
    config.resolve.alias.set('dumi', process.env.UMI_DIR);

    return config;
  });
};
