import type { IDumiTechStack } from '@/types';
import rehypeDemo from './rehypeDemo';
import rehypeIsolation from './rehypeIsolation';
import rehypeJsxify from './rehypeJsxify';
import rehypeStrip from './rehypeStrip';

export interface IMdTransformerOptions {
  cwd: string;
  fileAbsPath: string;
  techStacks: IDumiTechStack[];
}

export interface IMdTransformerResult {
  content: string;
  meta: {
    demos: { id: string; component: string }[];
  };
}

export default async (raw: string, opts: IMdTransformerOptions) => {
  const { unified } = await import('unified');
  const { default: remarkParse } = await import('remark-parse');
  const { default: remarkGfm } = await import('remark-gfm');
  const { default: remarkRehype } = await import('remark-rehype');
  const { default: rehypeRaw } = await import('rehype-raw');
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStrip)
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
    meta: result.data as IMdTransformerResult['meta'],
  };
};
