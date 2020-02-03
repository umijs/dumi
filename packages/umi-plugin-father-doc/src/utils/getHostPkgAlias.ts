import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
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
  const isLerna = fs.existsSync(path.join(paths.cwd, 'lerna.json'));
  const pkgs = [];

  if (isLerna) {
    // for lerna repo
    JSON.parse(
      execSync(
        `${path.join(paths.cwd, 'node_modules/.bin/lerna')} ls --json`,
        { stdio: 'pipe' },
      ).toString(),
    ).forEach(pkg => {
      pkgs.push([pkg.name, pkg.location]);
    });
  } else {
    // for standard repo
    pkgs.push(getPkgAliasForPath(paths.cwd));
  }

  return pkgs;
};
