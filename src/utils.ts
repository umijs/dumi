import { lodash, winPath } from 'umi/plugin-utils';

/**
 * get route path from file-system path
 */
export function getRoutePathFromFsPath(fsPath: string) {
  return lodash.kebabCase(winPath(fsPath).replace(/((\/|^)index)?\.\w+$/g, ''));
}
