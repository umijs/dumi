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
export default (absPath: string, opts: IDumiOpts): IRoute | null => {
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

  // check resolve rule
  const fileParsed = path.parse(absPath);
  const fileDirAbsPath = fileParsed.dir;
  const isRcFile = ['.tsx', '.jsx'].includes(fileParsed.ext);
  const isValidResolveDir = (dir: string) => {
    if (fileDirAbsPath.startsWith(path.resolve(cwd, dir))) {
      return true;
    }
  };
  let isExampleDir;
  let resolveDir = opts?.resolve?.includes?.find(isValidResolveDir);
  if (!resolveDir) {
    resolveDir = opts?.resolve?.examples?.find(isValidResolveDir);
    isExampleDir = Boolean(resolveDir);
  }
  if (!resolveDir || (isRcFile && !isExampleDir)) {
    return null;
  }

  // generate route
  return findFileRoute(
    absPath,
    opts,
    slash(`/${path.relative(path.resolve(cwd, resolveDir), fileDirAbsPath)}`),
    isRcFile && isExampleDir,
  );
};
