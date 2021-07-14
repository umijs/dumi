import fs from 'fs';
import path from 'path';
import { winPath, createDebug } from '@umijs/utils';
import { getModuleResolvePath } from '../utils/moduleResolver';
import ctx from '../context';

const debug = createDebug('dumi:theme');

interface ThemeComponent {
  /**
   * component name
   */
  identifier: string;
  /**
   * component path
   */
  source: string;
  /**
   * resolved module path
   */
  modulePath: string;
}

export interface IThemeLoadResult {
  /**
   * theme name
   */
  name: string;
  /**
   * theme module path
   */
  modulePath: string;
  /**
   * layout paths
   */
  layoutPaths: {
    /**
     * outer layout path
     */
    _: string;
    /**
     * single demo route layout path
     */
    demo: string | null;
  };
  /**
   * builtin components
   */
  builtins: ThemeComponent[];
  /**
   * fallback components
   */
  fallbacks: ThemeComponent[];
}

const THEME_PREFIX = 'dumi-theme-';
const LOCAL_THEME_PATH = '.dumi/theme';
const FALLBACK_THEME = `${THEME_PREFIX}default`;
const REQUIRED_THEME_BUILTINS = ['Previewer', 'SourceCode', 'Alert', 'Badge', 'Example', 'API'];
let cache: IThemeLoadResult | null;

/**
 * detect dumi theme in project dependencies
 */
function detectInstalledTheme() {
  const pkg = ctx.umi.pkg || {};
  const deps = Object.assign({}, pkg.devDependencies, pkg.dependencies);

  return Object.keys(deps).find(name => name.replace(/^@[\w-]+\//, '').startsWith(THEME_PREFIX));
}

/**
 * detect dumi theme in project dependencies
 */
function detectLocalTheme() {
  const detectPath = winPath(path.join(ctx.umi.cwd, LOCAL_THEME_PATH));

  return fs.existsSync(detectPath) ? detectPath : null;
}

/**
 * detect dumi theme
 */
function detectTheme() {
  const localTheme = detectLocalTheme();
  const installedTheme = detectInstalledTheme();

  return [localTheme, process.env.DUMI_THEME || installedTheme, FALLBACK_THEME].filter(Boolean);
}

/**
 * get resolved paths for theme module
 * @param sourcePath
 */
function getThemeResolvePaths(sourcePath: string) {
  // start search theme from @umijs/preset-dumi package, but use cwd if use relative theme folder
  const basePath = sourcePath.startsWith('.') ? ctx.umi.cwd : __dirname;
  const srcRegExp = /\/src\/(layout|builtins)/;
  let compiledModulePaths: { resolved: string; source: string };

  // search compiled module in es/lib instead of src firstly, for compatible with mfsu
  if (srcRegExp.test(sourcePath)) {
    try {
      compiledModulePaths = getThemeResolvePaths(sourcePath.replace(srcRegExp, '/es/$1')) || /* istanbul ignore next */ getThemeResolvePaths(sourcePath.replace(srcRegExp, '/lib/$1'));
    } catch (err) { /* nothing */ }
  }

  return compiledModulePaths || {
    resolved: getModuleResolvePath({
      basePath,
      sourcePath,
      silent: true,
    }),
    source: sourcePath,
  };
}

/**
 * join win path and keep the leading period
 * @param args paths
 */
function pathJoin(...args: string[]) {
  return winPath(`${args[0].match(/^\.[\/\\]/)?.[0] || ''}${path.join(...args)}`);
}

/**
 * get entry directory for theme package
 * @param modulePath  theme package path
 */
function getThemeEntryDir(modulePath: string) {
  const dirs = [pathJoin(modulePath, 'es'), pathJoin(modulePath, 'lib'), pathJoin(modulePath, 'src')];

  return dirs.find(dir => fs.existsSync(dir));
}

export default async () => {
  if (!cache || process.env.NODE_ENV === 'test') {
    const [theme, fb = FALLBACK_THEME] = detectTheme();
    const fallback = fb.startsWith('.') ? winPath(path.dirname(getThemeResolvePaths(fb).resolved)) : fb;
    const modulePath = path.isAbsolute(theme)
      ? theme
      : // resolve real absolute path for theme package
        winPath(path.dirname(getThemeResolvePaths(theme).resolved));
    // local theme has no src directory but theme package has
    const entryDir = path.isAbsolute(theme) ? theme : getThemeEntryDir(modulePath);
    const builtinPath = pathJoin(entryDir, 'builtins');

    debug('theme:', theme, `fallback:`, fallback);

    const components = fs.existsSync(builtinPath)
      ? fs
          .readdirSync(builtinPath)
          .filter(file => /\.(j|t)sx?$/.test(file))
          .map(file => ({
            identifier: path.parse(file).name,
            source: theme.startsWith('.')
              ? // use abs path for relative theme folder
                pathJoin(builtinPath, file)
              : // still use module identifier rather than abs path for theme package and absolute theme folder
                pathJoin(theme, builtinPath.replace(modulePath, ''), file),
            modulePath: pathJoin(builtinPath, file),
          }))
      : [];
    const fallbacks = REQUIRED_THEME_BUILTINS.reduce((result, bName) => {
      if (components.every(({ identifier }) => identifier !== bName)) {
        let cSource: string;
        let cModulePath: string;

        try {
          cSource = pathJoin(fallback, 'src', 'builtins', `${bName}`);
          ({ resolved: cModulePath, source: cSource } = getThemeResolvePaths(cSource));
        } catch (err) {
          debug('fallback to default theme for:', cSource);
          // fallback to default theme if detected fallback theme missed some components
          cSource = pathJoin(FALLBACK_THEME, 'src', 'builtins', `${bName}`);
          ({ resolved: cModulePath, source: cSource } = getThemeResolvePaths(cSource));
        }

        result.push({
          identifier: bName,
          source: cSource,
          cModulePath,
        });
      }

      return result;
    }, []);
    const layoutPaths = {} as IThemeLoadResult['layoutPaths'];

    // outer layout: layout.tsx or layouts/index.tsx
    [
      pathJoin(entryDir, 'layout'),
      pathJoin(entryDir, 'layouts'),
      pathJoin(fallback, 'src', 'layout'),
      pathJoin(fallback, 'src', 'layouts'),
    ].some((layoutPath, i, outerLayoutPaths) => {
      try {
        layoutPaths._ = getThemeResolvePaths(layoutPath).resolved;

        return true;
      } catch (err) {
        // fallback to default theme layout if cannot find any valid layout
        if (i === outerLayoutPaths.length - 1) {
          layoutPaths._ = getThemeResolvePaths(pathJoin(FALLBACK_THEME, 'src', 'layout')).resolved;
        }
      }
    });

    // demo layout
    [pathJoin(entryDir, 'layouts', 'demo'), pathJoin(fallback, 'src', 'layouts', 'demo')].some(
      layoutPath => {
        try {
          layoutPaths.demo = getThemeResolvePaths(layoutPath).resolved;

          return true;
        } catch (err) {
          /* nothing */
        }
      },
    );

    cache = await ctx.umi.applyPlugins({
      key: 'dumi.modifyThemeResolved',
      type: ctx.umi.ApplyPluginsType.modify,
      initialValue: {
        name: theme,
        modulePath,
        builtins: components,
        fallbacks,
        layoutPaths,
      },
    });

    debug(cache);
  }

  return cache;
};
