import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { IApi } from 'umi-types';

function getPkgAliasForPath(absPath: string) {
  const result = [path.basename(absPath), absPath];
  const pkgPath = path.join(absPath, 'package.json');

  // use package.name if exists
  if (fs.existsSync(pkgPath)) {
    result[0] = require(pkgPath).name;
  }

  return result;
}

export default (paths: IApi['paths']) => {
  const lernaConfigPath = path.join(paths.cwd, 'lerna.json');
  const lernaConfig = fs.existsSync(lernaConfigPath) ? require(lernaConfigPath) : null;
  const pkgs = [];

  if (lernaConfig) {
    // for lerna repo
    (lernaConfig.packages || []).forEach(exp => {
      glob.sync(exp, { cwd: paths.cwd }).forEach(pkg => {
        pkgs.push(getPkgAliasForPath(path.join(paths.cwd, pkg)));
      });
    });
  } else {
    // for standard repo
    pkgs.push(getPkgAliasForPath(paths.cwd));
  }

  return pkgs;
};
