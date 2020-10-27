import unified, { Transformer } from 'unified';
import { Node } from 'unist';
import frontmatter from 'remark-frontmatter';
import math from 'remark-math';
import katex from 'rehype-katex';
import headings from 'rehype-autolink-headings';
import comments from 'rehype-remove-comments';
import stringify from 'rehype-stringify';
import parse from 'remark-parse';
import gfm from 'remark-gfm';
import rehype from './rehype';
import slug from './slug';
import meta from './meta';
import codeBlock from './codeBlock';
import code from './code';
import embed from './embed';
import link from './link';
import img from './img';
import previewer from './previewer';
import raw from './raw';
import jsxify from './jsxify';
import isolation from './isolation';
import sourceCode from './sourceCode';

interface IDumiVFileData {
  /**
   * markdown file path base cwd
   */
  filePath?: string;
  /**
   * markdown file updated time in git history, fallback to file updated time
   */
  updatedTime?: number;
  /**
   * the related component name of markdown file
   */
  componentName?: string;
  /**
   * page title
   */
  title?: string;
  /**
   * component uuid (for HiTu)
   */
  uuid?: string;
  /**
   * slug list in markdown file
   */
  slugs?: {
    depth: number;
    value: string;
    heading: string;
  }[];
}

export interface IDumiElmNode extends Node {
  properties: {
    id?: string;
    href?: string;
    [key: string]: any;
  };
  tagName: string;
  children?: IDumiElmNode[];
}

export type IDumiUnifiedTransformer = (
  node: Parameters<Transformer>[0],
  vFile: Parameters<Transformer>[1] & { data: IDumiVFileData },
  next?: Parameters<Transformer>[2],
) => ReturnType<Transformer>;

export default (source: string, fileAbsPath: string, type: 'jsx' | 'html') => {
  const rehypeCompiler: any = {
    jsx: [jsxify],
    html: [stringify, { allowDangerousHtml: true, closeSelfClosing: true }],
  }[type];
  const processor = unified()
    // parse to remark
    .use(parse)
    .use(gfm)
    // remark plugins
    .use(frontmatter)
    .use(math)
    .use(meta)
    .use(codeBlock)
    // remark to rehype
    .use(rehype)
    // rehype plugins
    .use(katex)
    .use(slug)
    .use(headings)
    .use(link)
    .use(sourceCode)
    .use(raw)
    .use(comments, { removeConditional: true })
    .use(img)
    .use(code)
    .use(embed)
    .use(previewer)
    .use(isolation)
    .data('fileAbsPath', fileAbsPath)
    .data('outputType', type);

  // apply compiler via type
  processor.use(rehypeCompiler[0], rehypeCompiler[1]);

  return processor.processSync(source);
};
