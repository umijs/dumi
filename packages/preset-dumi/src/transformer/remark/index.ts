import unified from 'unified';
import frontmatter from 'remark-frontmatter';
import math from 'remark-math';
import katex from 'rehype-katex';
import headings from 'rehype-autolink-headings';
import comments from 'rehype-remove-comments';
import stringify from 'rehype-stringify';
import parse from './parse';
import rehype from './rehype';
import slug from './slug';
import meta from './meta';
import code from './code';
import link from './link';
import img from './img';
import previewer from './previewer';
import raw from './raw';
import jsxify from './jsxify';
import isolation from './isolation';
import sourceCode from './sourceCode';

export default (source: string, fileAbsPath: string, type: 'jsx' | 'html') => {
  const rehypeCompiler = {
    jsx: [jsxify],
    html: [stringify, { allowDangerousHTML: true, closeSelfClosing: true }],
  }[type];
  const processor = unified()
    // parse to remark
    .use(parse)
    // remark plugins
    .use(frontmatter)
    .use(math)
    .use(meta)
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
    .use(previewer)
    .use(isolation)
    .data('fileAbsPath', fileAbsPath);

  // apply compiler via type
  processor.use(rehypeCompiler[0], rehypeCompiler[1]);

  return processor.processSync(source);
};
