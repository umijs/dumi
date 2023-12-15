import { getFileContentByRegExp, getFileRangeLines } from '@/utils';
import enhancedResolve from 'enhanced-resolve';
import fs from 'fs';
import type { Paragraph, Root } from 'mdast';
import path from 'path';
import type { Root as YAMLRoot } from 'remark-frontmatter';
import { winPath } from 'umi/plugin-utils';
import type { FrozenProcessor, Transformer } from 'unified';
import url from 'url';
import type { IMdTransformerOptions } from '.';
import remarkContainer from './remarkContainer';

const EMBED_OPEN_TAG = '<embed ';
const EMBED_CLOSE_TAG = '</embed>';

let unified: typeof import('unified').unified;
let remarkParse: typeof import('remark-parse').default;
let remarkFrontmatter: typeof import('remark-frontmatter').default;
let remarkDirective: typeof import('remark-directive').default;
let remarkGfm: typeof import('remark-gfm').default;
let visit: typeof import('unist-util-visit-parents').visitParents;

// workaround to import pure esm module
(async () => {
  ({ visitParents: visit } = await import('unist-util-visit-parents'));
  ({ unified } = await import('unified'));
  ({ default: remarkParse } = await import('remark-parse'));
  ({ default: remarkFrontmatter } = await import('remark-frontmatter'));
  ({ default: remarkDirective } = await import('remark-directive'));
  ({ default: remarkGfm } = await import('remark-gfm'));
})();

/**
 * remark plugin to replace relative src path
 */
function remarkReplaceSrc(opts: {
  fileAbsPath: string;
  parentAbsPath: string;
}) {
  function getEmbedRltPath(value: string) {
    const { fileAbsPath, parentAbsPath } = opts;
    const absPath = path.resolve(fileAbsPath, '..', value);

    return (
      winPath(path.relative(path.dirname(parentAbsPath), absPath))
        // add leading ./
        .replace(/^([^.])/, './$1')
    );
  }

  return (ast: Root) => {
    visit<Root, ['html', 'image', 'link']>(
      ast,
      ['html', 'image', 'link'],
      (node) => {
        switch (node.type) {
          // transform src for code & img, href for a, to the new relative path from parent file
          case 'html':
            if (/^<(code|img|a)[^>]+(src|href)=('|")\.\.?\//.test(node.value)) {
              node.value = node.value.replace(
                /(src|href)=("|')([^]+?)\2/,
                (_, tag, quote, value) =>
                  `${tag}=${quote}${getEmbedRltPath(value)}${quote}`,
              );
            }
            break;

          // transform url for markdown image & link, to the new relative path from parent file
          case 'image':
          case 'link':
            if (/^\.\.?\//.test(node.url)) {
              node.url = getEmbedRltPath(node.url);
            }
            break;

          default:
        }
      },
    );
  };
}

/**
 * remark compiler to return raw ast
 */
function remarkRawAST(this: FrozenProcessor) {
  this.Compiler = function Compiler(ast: Root) {
    // remove yaml node, to avoid override parent file frontmatter
    visit<YAMLRoot, 'yaml'>(ast, 'yaml', (node, ancestors) => {
      const parent = ancestors[ancestors.length - 1] as Root;

      ancestors[ancestors.length - 1].children.splice(
        parent.children.indexOf(node),
        1,
      );
    });

    return ast;
  };
}

export default function remarkEmbed(
  opts: Pick<IMdTransformerOptions, 'fileAbsPath' | 'alias'>,
): Transformer<Root> {
  const resolver = enhancedResolve.create.sync({
    extensions: ['.md'],
    alias: opts.alias,
  });

  return (tree, vFile) => {
    // initialize field
    vFile.data.embeds = [];

    visit<Root, 'html'>(tree, 'html', (node, ancestors) => {
      if (node.value.startsWith(EMBED_OPEN_TAG)) {
        let relatedNodeCount = 1;
        const parent = ancestors[ancestors.length - 1] as Paragraph;
        const grandParent = ancestors[ancestors.length - 2] as Root;
        const i = parent.children.indexOf(node);
        const src = node.value.match(/src=("|')([^"']+)\1/)?.[2];

        if (src) {
          const parsed = url.parse(src);
          const hash = decodeURIComponent(parsed.hash || '').replace('#', '');
          const absPath = resolver(
            path.dirname(opts.fileAbsPath),
            parsed.pathname!,
          ) as string;

          let content = fs.readFileSync(absPath, 'utf-8');

          // extract content by hash (line range or regexp)
          if (hash.startsWith('L')) {
            content = getFileRangeLines(content, hash);
          } else if (hash.startsWith('RE-')) {
            content = getFileContentByRegExp(content, hash.slice(3), absPath);
          }

          // parse partial content to mdast
          const {
            result: mdast,
            data: { embeds },
          } = unified()
            .use(remarkParse)
            // for nested embed
            .use(remarkEmbed, { ...opts, fileAbsPath: absPath })
            // for strip frontmatter
            .use(remarkFrontmatter)
            // apply directive & gfm plugin
            // why not re-use parent processor?
            // because directive & gfm is affect on micromark core parser rather than ast
            // and if they are not applied, the embed ast will be wrong
            .use(remarkDirective)
            .use(remarkContainer)
            .use(remarkGfm)
            // for update relative src path
            .use(remarkReplaceSrc, {
              fileAbsPath: absPath,
              parentAbsPath: opts.fileAbsPath,
            })
            // for return raw ast
            .use(remarkRawAST)
            .processSync(content);

          // find the closing tag if there has other nodes between embed tags
          if (!node.value.endsWith(EMBED_CLOSE_TAG)) {
            for (let j = i!; j < parent!.children.length; j++) {
              const sibling = parent!.children[j];
              const isCloseTag =
                sibling.type === 'html' && sibling.value === EMBED_CLOSE_TAG;

              if (isCloseTag) {
                relatedNodeCount += j - i!;
                break;
              } else if (j === parent!.children.length - 1) {
                throw new Error(`Missing close tag for \`${node.value}\``);
              }
            }
          }

          // replace embed tag's parent with new nodes
          const newParentNodes: Root['children'] = [
            ...(mdast as Root).children,
          ];
          const before = parent!.children.slice(0, i!);
          const after = parent!.children.slice(i! + relatedNodeCount);

          // extract to a before paragraph for all children that before embed tag
          if (before.length) {
            newParentNodes.unshift({
              type: 'paragraph',
              children: before,
            });
          }

          // extract to an after paragraph for all children that before embed tag
          if (after.length) {
            newParentNodes.push({
              type: 'paragraph',
              children: after,
            });
          }

          // replace parent
          grandParent!.children.splice(
            grandParent!.children.indexOf(parent),
            1,
            ...newParentNodes,
          );

          // record embed file path for declare loader dependency
          vFile.data.embeds!.push(...[absPath].concat(embeds!));
        }
      }
    });
  };
}
