import Cache from 'file-system-cache';
import yaml from 'js-yaml';
import path from 'path';
import { lodash, logger, winPath } from 'umi/plugin-utils';

/**
 * get route path from file-system path
 */
export function getRoutePathFromFsPath(fsPath: string) {
  return lodash.kebabCase(
    winPath(fsPath).replace(/((\/|^)index(\.[a-zA-Z-]+)?)?\.\w+$/g, ''),
  );
}

/**
 * get range lines of markdown file
 */
export const getFileRangeLines = (content: string, range: string) => {
  const [, start, end] = range?.match(/^L(\d+)(?:-L(\d+))?$/) || [];

  if (start) {
    const lineStart = parseInt(start, 10) - 1;
    const lineEnd = end ? parseInt(end, 10) : lineStart + 1;

    return content
      .split(/\r\n|\n/g)
      .slice(lineStart, lineEnd)
      .join('\n');
  }

  return content;
};

/**
 * get file content by regular expression
 * @param content   source file content
 * @param regexp    regular expression string
 * @param filePath  source file path
 */
export const getFileContentByRegExp = (
  content: string,
  regexp: string,
  filePath: string,
) => {
  try {
    // eslint-disable-next-line no-eval
    return content.match(eval(regexp))![0];
  } catch (err) {
    logger.error(`Extract markdown content failed, use the full content.
RegExp: ${regexp}
File: ${filePath}
Error: ${err}`);
    return content;
  }
};

/**
 * parse frontmatter from code string
 */
export function parseCodeFrontmatter(raw: string) {
  const [, comment = '', code = ''] = raw
    // clear head break lines
    .replace(/^\n\s*/, '')
    // split head comments & remaining code
    .match(/^(\/\*\*[^]*?\n\s*\*\/)?(?:\s|\n)*([^]+)?$/)!;

  const yamlComment = comment
    // clear / from head & foot for comment
    .replace(/^\/|\/$/g, '')
    // remove * from comments
    .replace(/(^|\n)\s*\*+/g, '$1');
  let frontmatter: Record<string, any> | null = null;

  try {
    frontmatter = yaml.load(yamlComment) as any;
  } catch {}

  return { code: frontmatter ? code : raw, frontmatter };
}

/**
 * get file-system cache for specific namespace
 */
const caches: Record<string, ReturnType<typeof Cache>> = {};
const CACHE_PATH = 'node_modules/.cache/dumi';
export function getCache(ns: string): typeof caches['0'] {
  // return fake cache if cache disabled
  if (process.env.DUMI_CACHE === 'none') {
    return { set() {}, get() {}, setSync() {}, getSync() {} } as any;
  }
  return (caches[ns] ??= Cache({ basePath: path.join(CACHE_PATH, ns) }));
}
