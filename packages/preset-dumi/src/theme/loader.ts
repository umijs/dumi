import fs from 'fs';
import path from 'path';
import { winPath } from '@umijs/utils';
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
   * layout file path
   */
  layoutPath: string;
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
const FALLBACK_THEME = `${THEME_PREFIX}default`;
const REQUIRED_THEME_BUILTINS = ['Previewer', 'SourceCode', 'Alert', 'Badge', 'Example'];
let cache: IThemeLoadResult | null;

/**
 * detect dumi theme in project dependencies
 */
function detectInstalledTheme() {
  const pkg = ctx.umi.pkg || {};
  const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);

  return Object.keys(deps).filter(name => name.startsWith(THEME_PREFIX));
}

export default async () => {
  if (!cache) {
    const [theme = FALLBACK_THEME] = detectInstalledTheme();
    const modulePath = winPath(path.join(ctx.umi.paths.absNodeModulesPath, theme));
    const builtinPath = path.join(modulePath, 'src/builtins');
    const components = fs.existsSync(builtinPath)
      ? fs
          .readdirSync(builtinPath)
          .filter(file => /\.(j|t)sx?$/.test(file))
          .map(file => ({
            identifier: path.parse(file).name,
            source: winPath(path.join(theme, 'src', 'builtins', file)),
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

    cache = await ctx.umi.applyPlugins({
      key: 'dumi.modifyThemeResolved',
      type: ctx.umi.ApplyPluginsType.modify,
      initialValue: {
        name: theme,
        layoutPath: winPath(path.join(theme, 'src', 'layout')),
        modulePath,
        builtins: components,
        fallbacks,
      },
    });
  }

  return cache;
};
