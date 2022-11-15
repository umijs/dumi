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
  /**
   * theme plugin path
   */
  plugin?: string;
}

/**
 * convert files to component map
 */
function getComponentMapFromDir(globExp: string, dir: string) {
  return glob
    .sync(globExp, { cwd: dir })
    .reduce<IThemeLoadResult['builtins']>((ret, file) => {
      const specifier = path.basename(
        winPath(file).replace(/(\/index)?\.[a-z]+$/, ''),
      );

      // ignore non-component files
      if (/^[A-Z\d]/.test(specifier)) {
        ret[specifier] = {
          specifier,
          source: winPath(path.join(dir, file)),
        };
      }

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
      const locale = path.basename(file.replace(/\.json$/, ''));

      ret[locale] = require(path.join(dir, file));

      return ret;
    }, {});
}

export default (dir: string): IThemeLoadResult => {
  const plugin = glob.sync('{plugin/index.{js,ts},plugin.{js,ts}}', {
    cwd: dir,
  })[0];

  return {
    name: path.basename(dir),
    path: dir,
    locales: getLocaleMapFromDir('locales/*.json', dir),
    builtins: getComponentMapFromDir(
      'builtins/{!(*.d),*/index}.{js,jsx,ts,tsx}',
      dir,
    ),
    slots: getComponentMapFromDir(
      'slots/{!(*.d),*/index}.{js,jsx,ts,tsx}',
      dir,
    ),
    layouts: getComponentMapFromDir(
      'layouts/{GlobalLayout,DocLayout,DemoLayout}{.,/index.}{js,jsx,ts,tsx}',
      dir,
    ) as IThemeLoadResult['layouts'],
    ...(plugin ? { plugin: path.join(dir, plugin) } : {}),
  };
};
