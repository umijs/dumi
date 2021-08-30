import fs from 'fs';
import path from 'path';
import slash from 'slash2';
import type { IRoute } from '@umijs/types';
import ignore from 'ignore';
import ctx from '../context';
import { findFileRoute, isValidPath } from './getRouteConfigFromDir';
import type { IDumiOpts } from '../context';

/**
 * get route config from specific file path
 * @param absPath           absolute path
 * @param opts              dumi options
 */
export default (absPath: string, opts: IDumiOpts): IRoute => {
  // not exist or invalid
  if (!fs.existsSync(absPath) || !isValidPath(absPath)) {
    return null;
  }

  const cwd = ctx.umi?.cwd || process.cwd();
  const filePath = slash(path.relative(cwd, absPath));

  // excludes
  if (opts?.resolve?.excludes && ignore().add(opts.resolve.excludes).ignores(filePath)) {
    return null;
  }

  // not included
  const fileDirAbsPath = path.dirname(absPath);
  const getAbsPath = (dir: string) => (path.isAbsolute(dir) ? dir : path.join(cwd, dir));
  let parentRoute = '';
  opts?.resolve?.includes?.forEach(item => {
    const docsDirAbsPath = getAbsPath(item);
    if (fileDirAbsPath.startsWith(docsDirAbsPath)) {
      parentRoute = `/${path.relative(docsDirAbsPath, fileDirAbsPath)}`;
    }
  });
  let isExample = false;
  opts?.resolve?.examples?.forEach(item => {
    const exampleDirAbsPath = getAbsPath(item);
    if (fileDirAbsPath.startsWith(exampleDirAbsPath)) {
      parentRoute = `/${path.relative(exampleDirAbsPath, fileDirAbsPath)}`;
      isExample = true;
    }
  });
  if (parentRoute === '') {
    return null;
  }

  // generate route
  return findFileRoute(absPath, opts, parentRoute, isExample);
};
