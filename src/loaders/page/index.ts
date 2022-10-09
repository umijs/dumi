import { parseCodeFrontmatter } from '@/utils';
import path from 'path';
import { lodash } from 'umi/plugin-utils';

export default function pageMetaLoader(this: any, raw: string) {
  const pathWithoutIndex = this.resourcePath.replace(
    /(\/index([^/]+)?)?\.(j|t)sx?$/,
    '',
  );
  let { frontmatter } = parseCodeFrontmatter(raw);

  frontmatter ||= {};
  // fallback use filename as page title
  frontmatter.title ??= lodash.startCase(path.basename(pathWithoutIndex));

  return `export const frontmatter = ${JSON.stringify(frontmatter)};
export const toc = [];
export const demos = {};`;
}
