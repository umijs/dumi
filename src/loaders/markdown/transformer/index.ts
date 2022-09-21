import type { IParsedBlockAsset } from '@/assetParsers/block';
import type { IDumiTechStack } from '@/types';
import type { DataMap } from 'vfile';
import rehypeDemo from './rehypeDemo';
import rehypeEmbed from './rehypeEmbed';
import rehypeIsolation from './rehypeIsolation';
import rehypeJsxify from './rehypeJsxify';
import rehypeRaw from './rehypeRaw';
import rehypeStrip from './rehypeStrip';

declare module 'hast' {
  interface Element {
    // support pass props for custom react component
    // use simple string value on node, then rehypeJsxify will convert it to ast
    JSXAttributes?: Array<
      | { type: 'JSXAttribute'; name: string; value: string }
      | { type: 'JSXSpreadAttribute'; argument: string }
    >;
  }
}

declare module 'vfile' {
  interface DataMap {
    demos: {
      id: string;
      component: string;
      asset: IParsedBlockAsset['asset'];
      sources: IParsedBlockAsset['sources'];
    }[];
  }
}

export interface IMdTransformerOptions {
  cwd: string;
  fileAbsPath: string;
  techStacks: IDumiTechStack[];
}

export interface IMdTransformerResult {
  content: string;
  meta: DataMap;
}

export default async (raw: string, opts: IMdTransformerOptions) => {
  const { unified } = await import('unified');
  const { default: remarkParse } = await import('remark-parse');
  const { default: remarkFrontmatter } = await import('remark-frontmatter');
  const { default: remarkBreaks } = await import('remark-breaks');
  const { default: remarkGfm } = await import('remark-gfm');
  const { default: remarkRehype } = await import('remark-rehype');
  const result = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkBreaks)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStrip)
    .use(rehypeEmbed, {
      fileAbsPath: opts.fileAbsPath,
    })
    .use(rehypeDemo, {
      techStacks: opts.techStacks,
      cwd: opts.cwd,
      fileAbsPath: opts.fileAbsPath,
    })
    .use(rehypeIsolation)
    .use(rehypeJsxify)
    .process(raw);

  return {
    content: String(result.value),
    meta: result.data,
  };
};
