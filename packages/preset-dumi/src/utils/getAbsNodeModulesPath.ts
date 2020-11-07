import path from 'path';

/**
 * 将路径解析到node_modules的绝对路径
 * @author HeavenSky
 * @date 2020-11-07
 * @param {string} name  模块路径
 * @returns {string|null}  绝对路径或null
 * 如参数: dumi/drc; 则返回: /Users/sky/Desktop/repo/node_modules/_dumi@1.1.0-beta.31@dumi/src
 */
const getAbsNodeModulesPath = (name: string): string | null => {
  if (!name) {
    return null;
  }
  if (path.isAbsolute(name)) {
    return name;
  }
  const srcs = path.normalize(name).split(path.sep);
  const pkg = path.join(srcs[0], 'package.json');
  let pkgPath;
  try {
    pkgPath = require.resolve(pkg);
  } catch (_err) {
    /** ignore pkg not exist error */
  }
  // 判断node_modules内是否有此模块,若存在,再将后续路径拼接上
  if (pkgPath) {
    srcs.splice(0, 1, path.dirname(pkgPath));
    return path.join(...srcs);
  }
  return null;
};

export default getAbsNodeModulesPath;
