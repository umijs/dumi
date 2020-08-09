import yaml from 'js-yaml';
import remark from './remark';
import FileCache from '../utils/cache';

export interface TransformResult {
  content: string;
  meta: { [key: string]: any };
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
    opts: { type: 'jsx' | 'html' } = { type: 'jsx' },
  ): TransformResult {
    // use cache first
    const result =
      (fileAbsPath && cachers.markdown.get(fileAbsPath)) || remark(raw, fileAbsPath, opts.type);

    // save cache for the content which has real path
    if (fileAbsPath) {
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

    return { content, meta: yaml.safeLoad(frontmatter) as object };
  },
};
