import { parseCodeFrontmatter } from '@/utils';

/**
 * loader for discard frontmatter from code file content
 */
export default function preRawLoader(this: any, raw: string) {
  if (/\.(j|t)sx?$/.test(this.resourcePath)) {
    return parseCodeFrontmatter(raw).code;
  }

  return raw;
}
