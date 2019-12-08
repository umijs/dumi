import unified from 'unified';
import frontmatter from 'remark-frontmatter';
import stringify from 'rehype-stringify';
import slug from 'rehype-slug';
import headings from 'rehype-autolink-headings';
import comments from 'rehype-remove-comments';
import prism from '@mapbox/rehype-prism';
import parse, { IParseProps } from './parse';
import rehype from './rehype';
import yaml from './yaml';
import externalDemo from './externalDemo';
import previewer from './previewer';
import jsx from './jsx';
import isolation from './isolation';

export interface IRemarkOpts {
  /**
   * the directory for the file which will be transformed
   */
  fileAbsDir?: string;
  /**
   * transform strategy
   * @note  both md & data will be transformed by default
   *        only return data (FrontMatter & other vFile data) if pass 'data'
   */
  strategy: IParseProps['strategy'];
}

/**
 * strategy mapping for different transform strategy
 */
const PLUGIN_STRATEGIES = {
  default: [
    [frontmatter],
    [yaml],
    [externalDemo],
    [rehype],
    [stringify, { allowDangerousHTML: true, closeSelfClosing: true }],
    [slug],
    [headings],
    [comments, { removeConditional: true }],
    [prism],
    [previewer],
    [jsx],
    [isolation],
  ],
  data: [
    [frontmatter],
    [yaml],
    [rehype],
    [stringify],
  ],
} as {
  [key: string]: [any][]
};

export default (raw: string, opts: IRemarkOpts) => {
  const processor = unified()
    .use(parse, { strategy: opts.strategy || 'default' })
    .data('fileAbsDir', opts.fileAbsDir);

  // apply plugins through strategy
  PLUGIN_STRATEGIES[opts.strategy].forEach((plugin) => {
    processor.use(...plugin);
  });

  return processor.processSync(raw);
};
