import unified from 'unified';
import frontmatter from 'remark-frontmatter';
import stringify from 'rehype-stringify';
import slug from 'rehype-slug';
import headings from 'rehype-autolink-headings';
import comments from 'rehype-remove-comments';
import math from 'remark-math';
import katex from 'rehype-katex';
import parse, { IParseProps } from './parse';
import rehype from './rehype';
import yaml from './yaml';
import header from './header';
import externalDemo from './externalDemo';
import link from './link';
import img from './img';
import previewer from './previewer';
import jsx from './jsx';
import isolation from './isolation';
import sourceCode from './sourceCode';

export interface IRemarkOpts {
  /**
   * the path of file which will be transformed
   */
  fileAbsPath?: string;
  /**
   * transform strategy
   * @note  both md & data will be transformed by default
   *        only return data (FrontMatter & other vFile data) if pass 'data'
   */
  strategy: IParseProps['strategy'];
  /**
   * which code block languages will be parse to previewer
   */
  previewLangs: IParseProps['langs'];
}

/**
 * strategy mapping for different transform strategy
 */
const PLUGIN_STRATEGIES = {
  default: [
    [frontmatter],
    [yaml],
    [externalDemo],
    [math],
    [rehype],
    [katex],
    [stringify, { allowDangerousHTML: true, closeSelfClosing: true }],
    [slug],
    [headings],
    [header],
    [link],
    [img],
    [comments, { removeConditional: true }],
    [sourceCode],
    [previewer],
    [jsx],
    [isolation],
  ],
  data: [
    [frontmatter],
    [yaml],
    [externalDemo],
    [rehype],
    [stringify],
    [slug],
    [headings],
    [header],
  ],
} as {
  [key: string]: [any][];
};

export default (raw: string, opts: IRemarkOpts) => {
  const processor = unified()
    .use(parse, { strategy: opts.strategy || 'default', langs: opts.previewLangs })
    .data('fileAbsPath', opts.fileAbsPath);

  // apply plugins through strategy
  PLUGIN_STRATEGIES[opts.strategy].forEach(plugin => {
    processor.use(...plugin);
  });

  return processor.processSync(raw);
};
