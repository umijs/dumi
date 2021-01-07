import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { IApi } from '@umijs/types';

function getPkgAliasForPath(absPath: string) {
  const result: [string, string] = [path.basename(absPath), absPath];
  const pkgPath = path.join(absPath, 'package.json');

  // use package.name if exists
  if (fs.existsSync(pkgPath)) {
    result[0] = require(pkgPath).name;
  }

  return result;
}

export default (paths: IApi['paths']) => {
  const catalogPattern = /EnumerateProviders (catalog|totalPro)=\d+/g;
  const isLerna = fs.existsSync(path.join(paths.cwd, 'lerna.json'));
  const pkgs: [string, string][] = [];

  if (isLerna) {
    // for lerna repo
    const { version: lernaVersion } = require('lerna/package.json');

    if (lernaVersion.startsWith('3')) {
      let res = execSync(`${path.join(paths.cwd, 'node_modules/.bin/lerna')} ls --json --all`, {
        stdio: 'pipe',
      }).toString();
      // 修复windows环境下出现的 EnumerateProviders log导致的parse错误
      if (catalogPattern.test(res)) {
        res = res.replace(catalogPattern, "").trim()
      }
      JSON.parse(res).forEach(pkg => {
        pkgs.push([pkg.name, pkg.location]);
      });
    } else if (require.resolve('lerna/lib/PackageUtilities', { paths: [paths.cwd] })) {
      // reference: https://github.com/azz/lerna-get-packages/blob/master/index.js
      const PackageUtilities = require(require.resolve('lerna/lib/PackageUtilities', {
        paths: [paths.cwd],
      }));
      const Repository = require(require.resolve('lerna/lib/Repository', { paths: [paths.cwd] }));

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
