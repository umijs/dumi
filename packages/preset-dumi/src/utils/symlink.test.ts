import fs from 'fs';
import path from 'path';
import { rimraf } from '@umijs/utils';
import symlink, { resolveSrc } from './symlink';

describe('utils: symlink', () => {
  it('should symlink normal target', () => {
    const src = __filename;
    const dest = path.join(__dirname, 'fixtures', 'symlink-normal');

    symlink(src, dest);

    expect(() => fs.accessSync(dest, fs.constants.F_OK)).not.toThrowError();
    expect(fs.readlinkSync(dest)).toEqual(resolveSrc(src, dest));

    // clear dest
    rimraf.sync(dest);
  });

  it('should symlink parent non-exist target', () => {
    const src = __filename;
    const dest = path.join(__dirname, 'fixtures', 'symlink-non-exist', 'target');

    symlink(src, dest);

    expect(() => fs.accessSync(dest, fs.constants.F_OK)).not.toThrowError();
    expect(fs.readlinkSync(dest)).toEqual(resolveSrc(src, dest));

    // clear dest
    rimraf.sync(path.dirname(dest));
  });
});
