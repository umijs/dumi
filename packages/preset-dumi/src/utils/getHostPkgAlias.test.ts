import path from 'path';
import getHostPkgAlias from './getHostPkgAlias';

describe('getHostPkgAlias', () => {
  it('get normal pkg alias', () => {
    const pkgPath = path.join(__dirname, 'fixtures/alias-normal');
    const { name: pkgName } = require(path.join(pkgPath, 'package.json'));

    expect(getHostPkgAlias({ cwd: pkgPath })).toEqual([[pkgName, pkgPath]]);
  });

  it('get lerna pkg alias', () => {
    const alias = getHostPkgAlias({ cwd: path.join(__dirname, '../../../../') });

    expect(alias.map(([name]) => name)).toEqual([
      '@umijs/create-dumi-app',
      '@umijs/create-dumi-lib',
      'dumi',
      '@umijs/preset-dumi',
    ]);
  });
});
