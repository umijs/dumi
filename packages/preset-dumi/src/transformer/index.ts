import remark from './remark';
import FileCache from '../utils/cache';
import yaml from '../utils/yaml';

export interface TransformResult {
  content: string;
  meta: Record<string, any>;
}

const cachers = {
  markdown: new FileCache(),
};

export default {
  /**
   * transform markdown to jsx & metas
   * @param raw         raw content
   * @param fileAbsPath source file path
   * @param opts        transform options
   */
  markdown(
    raw: string,
    fileAbsPath: string | null,
    { type = 'jsx', noCache }: { type?: 'jsx' | 'html'; noCache?: boolean } = {},
  ): TransformResult {
    // use cache first
    const result =
      (fileAbsPath && !noCache && cachers.markdown.get(fileAbsPath)) ||
      remark(raw, fileAbsPath, type);

    // save cache for the content which has real path
    if (fileAbsPath && !noCache) {
      cachers.markdown.add(fileAbsPath, result);
    }

    return {
      content: result.contents,
      meta: result.data,
    } as TransformResult;
  },
  /**
   * split frontmatters & content for code block
   * @param raw   raw content
   */
  code(raw: string): TransformResult {
    const [, comments = '', content = ''] = raw
      // clear head break lines
      .replace(/^\n\s*/, '')
      // split head comments & remaining code
      .match(/^(\/\*\*[^]*?\n\s*\*\/)?(?:\s|\n)*([^]+)?$/);

    const frontmatter = comments
      // clear / from head & foot for comment
      .replace(/^\/|\/$/g, '')
      // remove * from comments
      .replace(/(^|\n)\s*\*+/g, '$1');

    return { content, meta: yaml(frontmatter) };
  },
};
