import type { IParsedBlockAsset } from '@/assetParsers/block';
import type { ILocalesConfig, IRouteMeta } from '@/client/theme-api/types';
import { VERSION_2_DEPRECATE_SOFT_BREAKS } from '@/constants';
import type { IApi, IDumiConfig, IDumiTechStack } from '@/types';
import enhancedResolve from 'enhanced-resolve';
import type { IRoute } from 'umi';
import { semver } from 'umi/plugin-utils';
import type { Plugin, Processor } from 'unified';
import type { Data } from 'vfile';
import rehypeDemo from './rehypeDemo';
import rehypeDesc from './rehypeDesc';
import rehypeEnhancedTag from './rehypeEnhancedTag';
import rehypeHighlightLine from './rehypeHighlightLine';
import rehypeImg from './rehypeImg';
import rehypeIsolation from './rehypeIsolation';
import rehypeJsxify from './rehypeJsxify';
import rehypeLink from './rehypeLink';
import rehypeRaw from './rehypeRaw';
import rehypeSlug from './rehypeSlug';
import rehypeStrip from './rehypeStrip';
import rehypeText from './rehypeText';
import remarkBreaks from './remarkBreaks';
import remarkContainer from './remarkContainer';
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
    embeds: string[];
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
  routes: Record<string, IRoute>;
  locales: ILocalesConfig;
  pkg: IApi['pkg'];
}

export interface IMdTransformerResult {
  content: string;
  meta: Data;
}

/**
 * keep markdown soft break before 2.2.0
 */
function keepSoftBreak(pkg: IApi['pkg']) {
  // for dumi local example project
  if (pkg?.name?.startsWith('@examples/') || pkg?.name === 'dumi') return false;

  const ver = pkg?.devDependencies?.dumi ?? pkg?.dependencies?.dumi ?? '^2.0.0';
  return !semver.subset(ver, VERSION_2_DEPRECATE_SOFT_BREAKS);
}

async function applyUnifiedPlugin(opts: {
  processor: Processor;
  plugin: NonNullable<IMdTransformerOptions['extraRemarkPlugins']>[0];
  cwd: IMdTransformerOptions['cwd'];
}) {
  const [plugin, options] = Array.isArray(opts.plugin)
    ? opts.plugin
    : [opts.plugin];

  let mod = typeof plugin === 'function' ? plugin : await import(plugin);

  const fn: Plugin = mod.default || mod;

  opts.processor.use(fn, options);
}

export default async (raw: string, opts: IMdTransformerOptions) => {
  let fileLocaleLessPath = opts.fileAbsPath;
  const { unified } = await import('unified');
  const { default: remarkParse } = await import('remark-parse');
  const { default: remarkFrontmatter } = await import('remark-frontmatter');
  const { default: remarkDirective } = await import('remark-directive');
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
  const fileLocale = opts.locales.find((locale) =>
    opts.fileAbsPath.endsWith(`.${locale.id}.md`),
  )?.id;

  // generate locale-less file abs path, for generate code id and atom id
  if (fileLocale) {
    fileLocaleLessPath = opts.fileAbsPath.replace(`.${fileLocale}.md`, '.md');
  }

  const processor = unified()
    .use(remarkParse)
    .use(remarkEmbed, { fileAbsPath: opts.fileAbsPath, alias: opts.alias })
    .use(remarkFrontmatter)
    .use(remarkMeta, {
      cwd: opts.cwd,
      fileAbsPath: opts.fileAbsPath,
      fileLocaleLessPath,
      resolve: opts.resolve,
    })
    .use(remarkDirective)
    .use(remarkContainer)
    .use(remarkGfm);

  if (keepSoftBreak(opts.pkg)) {
    processor.use(remarkBreaks, { fileAbsPath: opts.fileAbsPath });
  }

  // apply extra remark plugins
  for (const plugin of opts.extraRemarkPlugins ?? []) {
    await applyUnifiedPlugin({
      plugin,
      processor,
      cwd: opts.cwd,
    });
  }

  // apply internal rehype plugins
  processor
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw, {
      fileAbsPath: opts.fileAbsPath,
    })
    .use(rehypeHighlightLine)
    .use(rehypeRemoveComments, { removeConditional: true })
    .use(rehypeStrip)
    .use(rehypeImg)
    .use(rehypeDemo, {
      techStacks: opts.techStacks,
      cwd: opts.cwd,
      fileAbsPath: opts.fileAbsPath,
      fileLocaleLessPath,
      fileLocale,
      resolve: opts.resolve,
      resolver,
    })
    .use(rehypeSlug)
    .use(rehypeLink, {
      fileAbsPath: opts.fileAbsPath,
      routes: opts.routes,
    })
    .use(rehypeAutolinkHeadings)
    .use(rehypeIsolation)
    .use(rehypeEnhancedTag)
    .use(rehypeDesc)
    // collect all texts for content search, must be the last rehype plugin
    .use(rehypeText);

  for (const plugin of opts.extraRehypePlugins ?? []) {
    await applyUnifiedPlugin({
      plugin,
      processor,
      cwd: opts.cwd,
    });
  }

  // info available to all plugins
  processor.data('fileAbsPath', opts.fileAbsPath);

  const result = await processor.use(rehypeJsxify).process(raw);

  return {
    content: String(result.value),
    meta: result.data,
  };
};
