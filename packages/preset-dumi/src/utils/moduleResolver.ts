import fs from 'fs';
import path from 'path';
import slash from 'slash2';
import resolve from 'enhanced-resolve';
import getHostPkgAlias from './getHostPkgAlias';
import ctx from '../context';

const DEFAULT_EXT = ['.tsx', '.jsx', '.js', '.ts'];

interface IModuleResolverOpts {
  basePath: string;
  sourcePath: string;
  extensions?: string[];
  silent?: boolean;
}

const getResolveAlias = (() => {
  let cache: any;

  return () => {
    if (!cache) {
      const hostPkgAlias = getHostPkgAlias(ctx.umi?.paths).map(([pkgName]) => pkgName);

      cache = Object.entries(ctx.umi?.config?.alias || {}).reduce((result, [name, value]) => {
        // discard local package alias to use symlink in node_modules, for collect locale packages as third-party dependencies
        if (!hostPkgAlias.includes(name)) {
          result[name] = value;
        }

        return result;
      }, {});
    }

    return cache;
  };
})();

/**
 * resolve module path base on umi context (alias)
 */
export const getModuleResolvePath = ({
  basePath,
  sourcePath,
  extensions = DEFAULT_EXT,
  silent,
}: IModuleResolverOpts) => {
  try {
    return slash(
      resolve.create.sync({
        extensions,
        alias: getResolveAlias(),
        symlinks: false,
        mainFiles: ['index', 'package.json'],
      })(fs.statSync(basePath).isDirectory() ? basePath : path.parse(basePath).dir, sourcePath),
    );
  } catch (err) {
    if (!silent) {
      ctx.umi?.logger.error(`[dumi]: cannot resolve module ${sourcePath} from ${basePath}`);
    }

    throw err;
  }
};

/**
 * resolve module version
 */
export const getModuleResolvePkg = ({
  basePath,
  sourcePath,
  extensions = DEFAULT_EXT,
}: IModuleResolverOpts) => {
  let version: string | null;
  let name: string | null;
  let peerDependencies: any | null;
  const resolvePath = getModuleResolvePath({ basePath, sourcePath, extensions });
  const modulePath = resolvePath.match(/^(.*?node_modules\/(?:@[^/]+\/)?[^/]+)/)?.[1];
  const pkgPath = path.join(modulePath, 'package.json');

  if (modulePath && fs.existsSync(pkgPath)) {
    const pkg = require(pkgPath);

    version = pkg.version;
    name = pkg.name;
    peerDependencies = pkg.peerDependencies;
  } else {
    ctx.umi?.logger.error(`[dumi]: cannot find valid package.json for module ${modulePath}`);
  }

  return { name, version, peerDependencies };
};

/**
 * resolve module content
 */
export const getModuleResolveContent = ({
  basePath,
  sourcePath,
  extensions = DEFAULT_EXT,
}: IModuleResolverOpts) => {
  const resolvePath = getModuleResolvePath({ basePath, sourcePath, extensions });

  return resolvePath ? fs.readFileSync(resolvePath).toString() : '';
};
