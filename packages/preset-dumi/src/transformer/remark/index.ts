import { createDebug } from '@umijs/utils';
import type { Transformer } from 'unified';
import unified from 'unified';
import type { Node } from 'unist';
import frontmatter from 'remark-frontmatter';
import math from 'remark-math';
import mathjax from 'rehype-mathjax';
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
import api from './api';
import link from './link';
import img from './img';
import previewer from './previewer';
import raw from './raw';
import jsxify from './jsxify';
import isolation from './isolation';
import domWarn from './domWarn';
import sourceCode from './sourceCode';

const log = createDebug('dumi:remark');

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
   * component keywords
   */
  keywords?: string[];
  /**
   * mark component deprecated
   */
  deprecated?: true;
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

function debug(name: string) {
  return function debugPlugin() {
    return () => {
      if (this.data('fileAbsPath')) {
        log(name, this.data('fileAbsPath'));
      }
    };
  };
}

// reserve unknown property for Node, to avoid custom plugin throw type error after @types/unist@2.0.4
declare module 'unist' {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  export interface Node {
    [key: string]: unknown;
  }
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

export default (source: string, fileAbsPath: string, type: 'jsx' | 'html', masterKey?: string) => {
  const rehypeCompiler: any = {
    jsx: [jsxify],
    html: [stringify, { allowDangerousHtml: true, closeSelfClosing: true }],
  }[type];
  const processor = unified()
    // parse to remark
    .use(parse)
    .use(debug('parse'))
    .use(gfm)
    .use(debug('gfm'))
    // remark plugins
    .use(frontmatter)
    .use(debug('frontmatter'))
    .use(math)
    .use(debug('math'))
    .use(meta)
    .use(debug('meta'))
    .use(codeBlock)
    .use(debug('codeBlock'))
    // remark to rehype
    .use(rehype)
    .use(debug('rehype'))
    // rehype plugins
    .use(mathjax)
    .use(debug('mathjax'))
    .use(sourceCode)
    .use(debug('sourceCode'))
    .use(raw)
    .use(debug('raw'))
    .use(domWarn)
    .use(debug('domWarn'))
    .use(comments, { removeConditional: true })
    .use(debug('comments'))
    .use(code)
    .use(debug('code'))
    .use(api)
    .use(debug('api'))
    .use(slug)
    .use(debug('slug'))
    .use(embed)
    .use(debug('embed'))
    .use(headings)
    .use(debug('headings'))
    .use(link)
    .use(debug('link'))
    .use(img)
    .use(debug('img'))
    .use(previewer)
    .use(debug('previewer'))
    .use(isolation)
    .use(debug('isolation'))
    .data('masterKey', masterKey)
    .data('fileAbsPath', fileAbsPath)
    .data('outputType', type);

  // apply compiler via type
  processor.use(rehypeCompiler[0], rehypeCompiler[1]);

  const result = processor.processSync(source);
  debug('compiler').call(processor);

  return result;
};
