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
  const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);

  return Object.keys(deps).filter(name => name.replace(/^@[\w-]+\//, '').startsWith(THEME_PREFIX));
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

  return localTheme ? [localTheme] : detectInstalledTheme();
}

/**
 * get resolved path for theme module
 * @param sourcePath
 */
function getThemeResolvePath(sourcePath: string) {
  return getModuleResolvePath({
    basePath: ctx.umi.cwd,
    sourcePath,
    silent: true,
    // use empty alias to avoid dumi repo start failed
    // because the auto-alias target theme-default/src
    alias: {},
  });
}

export default async () => {
  if (!cache || process.env.NODE_ENV === 'test') {
    const [theme = process.env.DUMI_THEME || FALLBACK_THEME] = detectTheme();
    const modulePath = path.isAbsolute(theme)
      ? theme
      : // resolve real absolute path for theme package
        winPath(path.dirname(getThemeResolvePath(theme)));
    // local theme has no src directory but theme package has
    const srcPath = path.isAbsolute(theme) ? theme : `${modulePath}/src`;
    const builtinPath = winPath(path.join(srcPath, 'builtins'));
    const components = fs.existsSync(builtinPath)
      ? fs
          .readdirSync(builtinPath)
          .filter(file => /\.(j|t)sx?$/.test(file))
          .map(file => ({
            identifier: path.parse(file).name,
            // still use module identifier rather than abs path for theme package modules
            source: winPath(path.join(theme, builtinPath.replace(modulePath, ''), file)),
          }))
      : [];
    const fallbacks = REQUIRED_THEME_BUILTINS.reduce((result, bName) => {
      if (components.every(({ identifier }) => identifier !== bName)) {
        result.push({
          identifier: bName,
          source: winPath(path.join(FALLBACK_THEME, 'src', 'builtins', `${bName}`)),
        });
      }

      return result;
    }, []);
    const layoutPaths = {} as IThemeLoadResult['layoutPaths'];

    // outer layout: layout.tsx or layouts/index.tsx
    [winPath(path.join(srcPath, 'layout')), winPath(path.join(srcPath, 'layouts'))].some(
      (layoutPath, i, outerLayoutPaths) => {
        try {
          layoutPaths._ = getThemeResolvePath(layoutPath);

          return true;
        } catch (err) {
          // fallback to default theme layout if cannot find any valid layout
          if (i === outerLayoutPaths.length - 1) {
            layoutPaths._ = getThemeResolvePath(path.join(FALLBACK_THEME, 'src', 'layout'));
          }
        }
      },
    );

    // demo layout
    try {
      layoutPaths.demo = getThemeResolvePath(path.join(srcPath, 'layouts', 'demo'));
    } catch (err) {
      layoutPaths.demo = null;
    }

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
