import fs from 'fs';
import path from 'path';
import { winPath } from '@umijs/utils';
import { getModuleResolvePath } from '../utils/moduleResolver';
import ctx from '../context';

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
const REQUIRED_THEME_BUILTINS = ['Previewer', 'SourceCode', 'Alert', 'Badge', 'Example'];
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

export default async () => {
  if (!cache || process.env.NODE_ENV === 'test') {
    const [name = process.env.DUMI_THEME || FALLBACK_THEME] = detectTheme();
    const theme = name.startsWith('/') ? name : `${name}/src`;
    const modulePath = winPath(path.resolve(ctx.umi.paths.absNodeModulesPath, theme));
    const builtinPath = path.join(modulePath, 'builtins');
    const components = fs.existsSync(builtinPath)
      ? fs
          .readdirSync(builtinPath)
          .filter(file => /\.(j|t)sx?$/.test(file))
          .map(file => ({
            identifier: path.parse(file).name,
            source: winPath(path.join(theme, 'builtins', file)),
          }))
      : [];
    const fallbacks = REQUIRED_THEME_BUILTINS.reduce((result, name) => {
      if (components.every(({ identifier }) => identifier !== name)) {
        result.push({
          identifier: name,
          source: winPath(path.join(FALLBACK_THEME, 'src', 'builtins', `${name}`)),
        });
      }

      return result;
    }, []);
    const layoutPaths = {} as IThemeLoadResult['layoutPaths'];

    // outer layout: layout.tsx or layouts/index.tsx
    [winPath(path.join(theme, 'layout')), winPath(path.join(theme, 'layouts'))].some(
      (layoutPath, i, outerLayoutPaths) => {
        try {
          getModuleResolvePath({
            basePath: ctx.umi.paths.cwd,
            sourcePath: layoutPath,
            silent: true,
          });

          layoutPaths._ = layoutPath;

          return true;
        } catch (err) {
          // fallback to default theme layout if cannot find any valid layout
          if (i === outerLayoutPaths.length - 1) {
            layoutPaths._ = winPath(path.join(FALLBACK_THEME, 'src', 'layout'));
          }
        }
      },
    );

    // demo layout
    try {
      layoutPaths.demo = winPath(path.join(theme, 'layouts', 'demo'));

      getModuleResolvePath({
        basePath: ctx.umi.paths.cwd,
        sourcePath: layoutPaths.demo,
        silent: true,
      });
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
  }

  return cache;
};
