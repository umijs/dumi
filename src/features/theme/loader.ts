import path from 'path';
import { glob, winPath } from 'umi/plugin-utils';

export interface IThemeComponent {
  specifier: string;
  source: string;
}

export interface IThemeLoadResult {
  /**
   * theme package name
   */
  name: string;
  /**
   * theme package path
   */
  path: string;
  /**
   * locale text data
   */
  locales: {
    [key: string]: Record<string, string>;
  };
  /**
   * builtin components
   */
  builtins: {
    [key: string]: IThemeComponent;
  };
  /**
   * slots components
   */
  slots: {
    [key: string]: IThemeComponent;
  };
  /**
   * layout components
   */
  layouts: {
    /**
     * apply for all routes
     */
    GlobalLayout?: IThemeComponent;
    /**
     * apply for doc routes
     */
    DocLayout?: IThemeComponent;
    /**
     * apply for demo routes /~demos/:id
     */
    DemoLayout?: IThemeComponent;
  } & Record<string, IThemeComponent>;
}

/**
 * convert files to component map
 */
function getComponentMapFromDir(globExp: string, dir: string) {
  return glob
    .sync(globExp, { cwd: dir })
    .reduce<IThemeLoadResult['builtins']>((ret, file) => {
      const specifier = path.basename(file.replace(/(\/index)?\.[a-z]+$/, ''));

      ret[specifier] = {
        specifier,
        source: winPath(path.join(dir, file)),
      };

      return ret;
    }, {});
}

/**
 * convert files to locale map
 */
function getLocaleMapFromDir(globExp: string, dir: string) {
  return glob
    .sync(globExp, { cwd: dir })
    .reduce<IThemeLoadResult['locales']>((ret, file) => {
      const locale = file.replace(/\.json$/, '');

      ret[locale] = require(path.join(dir, file));

      return ret;
    }, {});
}

export default (dir: string): IThemeLoadResult => {
  return {
    name: path.basename(dir),
    path: dir,
    locales: getLocaleMapFromDir('locales/*.json', dir),
    builtins: getComponentMapFromDir(
      'builtins/{*,*/index}.{js,jsx,ts,tsx}',
      dir,
    ),
    slots: getComponentMapFromDir('slots/{*,*/index}.{js,jsx,ts,tsx}', dir),
    layouts: getComponentMapFromDir(
      'layouts/{GlobalLayout,DocLayout,DemoLayout}{.,/index.}{js,jsx,ts,tsx}',
      dir,
    ) as IThemeLoadResult['layouts'],
  };
};
