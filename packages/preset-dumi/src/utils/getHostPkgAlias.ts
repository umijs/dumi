import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { IApi } from '@umijs/types';

function getPkgAliasForPath(absPath: string) {
  const result: [string, string] = ['', absPath];
  const pkgPath = path.join(absPath, 'package.json');

  // use package.name if exists
  if (fs.existsSync(pkgPath)) {
    result[0] = require(pkgPath).name;
  }

  return result;
}

export default (paths: IApi['paths']) => {
  const isLerna = fs.existsSync(path.join(paths.cwd, 'lerna.json'));
  const isPnpmWorkspace = fs.existsSync(path.join(paths.cwd, 'pnpm-workspace.yaml'))
  const pkgs: [string, string][] = [];

  if (isLerna) {
    // for lerna repo
    const { version: lernaVersion } = require('lerna/package.json');
    const lernaMainVersion = Number(lernaVersion.split('.')[0]);
    if (lernaMainVersion >= 3) {
      JSON.parse(
        execSync(`${path.join(paths.cwd, 'node_modules/.bin/lerna')} ls --json --all`, {
          stdio: 'pipe',
          // fix: 修复windows环境下有多余输出导致JSON.parse报错的问题
        })
          .toString()
          .replace(/([\r\n]\])[^]*$/, '$1'),
      ).forEach(pkg => {
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
  } else if (isPnpmWorkspace) {
    JSON.parse(execSync('pnpm list -r --json', {
          stdio: 'pipe',
        })
          .toString()
          .replace(/([\r\n]\])[^]*$/, '$1')
    ).filter(pkg => pkg.path !== paths.cwd) // filter root pkg
    .forEach(pkg => {
        pkgs.push([pkg.name, pkg.path]);
      });
  } else {
    // for standard repo
    pkgs.push(getPkgAliasForPath(paths.cwd));
  }

  return pkgs;
};
