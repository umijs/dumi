import type { IParsedBlockAsset } from '@/assetParsers/block';
import type { IRouteMeta } from '@/client/theme-api/types';
import type { IDumiConfig, IDumiTechStack } from '@/types';
import enhancedResolve from 'enhanced-resolve';
import type { Plugin, Processor } from 'unified';
import type { Data } from 'vfile';
import rehypeDemo from './rehypeDemo';
import rehypeDesc from './rehypeDesc';
import rehypeEnhancedTag from './rehypeEnhancedTag';
import rehypeImg from './rehypeImg';
import rehypeIsolation from './rehypeIsolation';
import rehypeJsxify from './rehypeJsxify';
import rehypeRaw from './rehypeRaw';
import rehypeSlug from './rehypeSlug';
import rehypeStrip from './rehypeStrip';
import rehypeText from './rehypeText';
import remarkEmbed from './remarkEmbed';
import remarkMeta from './remarkMeta';

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
    demos: (
      | {
          id: string;
          component: string;
          asset: IParsedBlockAsset['asset'];
          sources: IParsedBlockAsset['sources'];
        }
      | {
          id: string;
          component: string;
        }
    )[];
    texts: IRouteMeta['texts'];
    frontmatter: IRouteMeta['frontmatter'];
    toc: IRouteMeta['toc'];
    embeds?: string[];
  }
}

export interface IMdTransformerOptions {
  cwd: string;
  fileAbsPath: string;
  alias: object;
  parentAbsPath?: string;
  techStacks: IDumiTechStack[];
  resolve: IDumiConfig['resolve'];
  extraRemarkPlugins?: IDumiConfig['extraRemarkPlugins'];
  extraRehypePlugins?: IDumiConfig['extraRehypePlugins'];
}

export interface IMdTransformerResult {
  content: string;
  meta: Data;
}

function applyUnifiedPlugin(opts: {
  processor: Processor;
  plugin: NonNullable<IMdTransformerOptions['extraRemarkPlugins']>[0];
  cwd: IMdTransformerOptions['cwd'];
}) {
  const [plugin, options] = Array.isArray(opts.plugin)
    ? opts.plugin
    : [opts.plugin];
  const mod =
    typeof plugin === 'function'
      ? plugin
      : require(require.resolve(plugin, { paths: [opts.cwd] }));
  const fn: Plugin = mod.default || mod;

  opts.processor.use(fn, options);
}

export default async (raw: string, opts: IMdTransformerOptions) => {
  const { unified } = await import('unified');
  const { default: remarkParse } = await import('remark-parse');
  const { default: remarkFrontmatter } = await import('remark-frontmatter');
  const { default: remarkBreaks } = await import('remark-breaks');
  const { default: remarkGfm } = await import('remark-gfm');
  const { default: remarkRehype } = await import('remark-rehype');
  const { default: rehypeAutolinkHeadings } = await import(
    'rehype-autolink-headings'
  );
  const { default: rehypeRemoveComments } = await import(
    'rehype-remove-comments'
  );
  const resolver = enhancedResolve.create.sync({
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: opts.alias,
  });

  const processor = unified()
    .use(remarkParse)
    .use(remarkEmbed, { fileAbsPath: opts.fileAbsPath, alias: opts.alias })
    .use(remarkFrontmatter)
    .use(remarkMeta, {
      cwd: opts.cwd,
      fileAbsPath: opts.fileAbsPath,
      resolve: opts.resolve,
    })
    .use(remarkBreaks)
    .use(remarkGfm);

  // apply extra remark plugins
  opts.extraRemarkPlugins?.forEach((plugin) =>
    applyUnifiedPlugin({
      plugin,
      processor,
      cwd: opts.cwd,
    }),
  );

  // apply internal rehype plugins
  processor
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeRemoveComments, { removeConditional: true })
    .use(rehypeStrip)
    .use(rehypeImg)
    .use(rehypeDemo, {
      techStacks: opts.techStacks,
      cwd: opts.cwd,
      fileAbsPath: opts.fileAbsPath,
      resolve: opts.resolve,
      resolver,
    })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeIsolation)
    .use(rehypeEnhancedTag)
    .use(rehypeDesc)
    // collect all texts for content search, must be the last rehype plugin
    .use(rehypeText);

  // apply extra rehype plugins
  opts.extraRehypePlugins?.forEach((plugin) =>
    applyUnifiedPlugin({
      plugin,
      processor,
      cwd: opts.cwd,
    }),
  );

  const result = await processor.use(rehypeJsxify).process(raw);

  return {
    content: String(result.value),
    meta: result.data,
  };
};
