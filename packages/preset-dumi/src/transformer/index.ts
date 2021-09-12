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
    { type = 'jsx', noCache, throwError }: { type?: 'jsx' | 'html'; noCache?: boolean; throwError?: boolean } = {},
  ): TransformResult {
    // use cache first
    let result = fileAbsPath && !noCache && cachers.markdown.get(fileAbsPath);

    if (!result) {
      try {
        result = { value: remark(raw, fileAbsPath, type) };
      } catch (error) {
        // return empty result & cache error
        result = { value: { contents: '', data: {} }, error };
      } finally {
        if (fileAbsPath && !noCache) {
          cachers.markdown.add(fileAbsPath, result);
        }
      }
    }

    // throw error for webpack loader but not throw for route initialize stage
    if (result.error && throwError) {
      throw result.error;
    }

    return {
      content: result.value.contents,
      meta: result.value.data,
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
    const meta = yaml(frontmatter);

    return { content: Object.keys(meta).length ? content : raw, meta, };
  },
};
