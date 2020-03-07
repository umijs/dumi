import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { IApi } from '@umijs/types';

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
    const lernaVersion = execSync(
      `${path.join(paths.cwd, 'node_modules/.bin/lerna')} -v`,
    ).toString();

    if (lernaVersion.startsWith('3')) {
      JSON.parse(
        execSync(`${path.join(paths.cwd, 'node_modules/.bin/lerna')} ls --json`, {
          stdio: 'pipe',
        }).toString(),
      ).forEach(pkg => {
        pkgs.push([pkg.name, pkg.location]);
      });
    } else if (require.resolve('lerna/lib/PackageUtilities', { paths: [paths.cwd] })) {
      // reference: https://github.com/azz/lerna-get-packages/blob/master/index.js
      var PackageUtilities = require(require.resolve('lerna/lib/PackageUtilities', {
        paths: [paths.cwd],
      }));
      var Repository = require(require.resolve('lerna/lib/Repository', { paths: [paths.cwd] }));

      PackageUtilities.getPackages(new Repository(paths.cwd)).forEach(pkg => {
        pkgs.push([pkg._package.name, pkg._location]);
      });
    }
  } else {
    // for standard repo
    pkgs.push(getPkgAliasForPath(paths.cwd));
  }

  return pkgs;
};
