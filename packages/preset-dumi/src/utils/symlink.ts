import fs from 'fs';
import path from 'path';

const isWin = process.platform === 'win32';

/**
 * resolve src from dest
 * @refer https://github.com/zkochan/symlink-dir/blob/master/src/index.ts#L18
 */
function resolveSrc(src: string, dest: string) {
  return isWin ? `${src}\\` : path.relative(path.dirname(dest), src);
}

export default (src: string, dest: string) => {
  const destDir = path.dirname(dest);
  const resolvedSrc = resolveSrc(src, dest);
  // see also: https://github.com/zkochan/symlink-dir/blob/master/src/index.ts#L14
  const symlinkType = isWin ? 'junction' : 'dir';

  // create directory first if node_modules/@group not exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // create src symlink relative dest
  fs.symlinkSync(resolvedSrc, dest, symlinkType);
};
