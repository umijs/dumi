import type { PluginItem } from '@umijs/bundler-utils/compiled/@babel/core';
import { logger } from '@umijs/utils';
import { isArray } from '@umijs/utils/compiled/lodash';
import { IApi } from 'umi';
export const shouldDisabledLiveDemo = (api: IApi) => {
  const extraBabelPlugins = api.userConfig.extraBabelPlugins;
  const disableFlag =
    isArray(extraBabelPlugins) &&
    extraBabelPlugins!.some((p: any) =>
      /^import$|babel-plugin-import/.test(p[0]),
    );
  if (disableFlag) {
    logger.warn(
      'live demo feature has been automatically disabled since babel-plugin-import be registered, if you want to enable live demo feature, checkout: https://d.umijs.org/guide/faq',
    );
  }
  return disableFlag;
};

/**
 * babel plugins which rely on static import declarations to work, they must be
 * applied to the original source of code-block demo before it is wrapped into
 * an async function, because the wrapping rewrites `import x from 'y'` into
 * `const { default: x } = await import('y')`
 * key: plugin name in `extraBabelPlugins`, value: package name to resolve
 */
const IMPORT_SENSITIVE_BABEL_PLUGINS: Record<string, string> = {
  '@emotion': '@emotion/babel-plugin',
  '@emotion/babel-plugin': '@emotion/babel-plugin',
};

const warnedMissingPlugins = new Set<string>();

/**
 * get the resolve target for import-sensitive babel plugin
 * @param name plugin name in `extraBabelPlugins`, e.g. `@emotion` or absolute path of plugin
 */
function getImportSensitivePluginTarget(name: string) {
  if (name in IMPORT_SENSITIVE_BABEL_PLUGINS) {
    return IMPORT_SENSITIVE_BABEL_PLUGINS[name];
  }

  // allow path of plugin, e.g. require.resolve('@emotion/babel-plugin')
  const normalized = name.replace(/\\/g, '/');
  const isPluginPath = Object.values(IMPORT_SENSITIVE_BABEL_PLUGINS).some(
    (pkg) => normalized.endsWith(`/${pkg}`) || normalized.includes(`/${pkg}/`),
  );

  return isPluginPath ? name : undefined;
}

/**
 * pick babel plugins which should be applied to code-block demos from `extraBabelPlugins`
 * @param extraBabelPlugins  `extraBabelPlugins` config of umi
 * @param cwd                project root, used to resolve plugin package
 * @returns resolved plugin items, always JSON-serializable (loader options of utoopack require it)
 */
export function getCodeBlockBabelPlugins(
  extraBabelPlugins: unknown,
  cwd: string,
): PluginItem[] {
  if (!isArray(extraBabelPlugins)) return [];

  return extraBabelPlugins.reduce<PluginItem[]>((ret, item) => {
    const [name, options] = isArray(item) ? item : [item];

    if (typeof name !== 'string') return ret;

    const target = getImportSensitivePluginTarget(name);

    if (!target) return ret;

    let pluginPath: string;

    try {
      pluginPath = require.resolve(target, { paths: [cwd] });
    } catch {
      // the package may be missing in utoopack/mako project because bundler
      // implements emotion transform by itself, tell user how to make it work
      if (!warnedMissingPlugins.has(target)) {
        warnedMissingPlugins.add(target);
        logger.warn(
          `\`${target}\` cannot be resolved, it will be skipped for code-block demos in markdown, install it if you need the transform result (e.g. auto label of emotion) for those demos.`,
        );
      }

      return ret;
    }

    ret.push(options === undefined ? pluginPath : [pluginPath, options]);

    return ret;
  }, []);
}
