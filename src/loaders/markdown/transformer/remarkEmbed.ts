import { getFileContentByRegExp, getFileRangeLines } from '@/utils';
import fs from 'fs';
import type { Root } from 'mdast';
import path from 'path';
import { winPath } from 'umi/plugin-utils';
import type { FrozenProcessor, Transformer } from 'unified';
import url from 'url';
import type { IMdTransformerOptions } from '.';

const EMBED_OPEN_TAG = '<embed ';
const EMBED_CLOSE_TAG = '</embed>';

let unified: typeof import('unified').unified;
let remarkParse: typeof import('remark-parse').default;
let remarkFrontmatter: typeof import('remark-frontmatter').default;
let visit: typeof import('unist-util-visit').visit;

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
  ({ unified } = await import('unified'));
  ({ default: remarkParse } = await import('remark-parse'));
  ({ default: remarkFrontmatter } = await import('remark-frontmatter'));
})();

/**
 * remark compiler to return raw ast
 */
function remarkRawAST(this: FrozenProcessor) {
  this.Compiler = function Compiler(ast: Root) {
    return ast;
  };
}

export default function remarkEmbed(
  opts: Pick<IMdTransformerOptions, 'fileAbsPath'>,
): Transformer<Root> {
  return (tree, vFile) => {
    visit<Root, 'html'>(tree, 'html', (node, i, parent) => {
      if (node.value.startsWith(EMBED_OPEN_TAG)) {
        let relatedNodeCount = 1;
        const src = node.value.match(/src=("|')([^"']+)\1/)?.[2];

        if (src) {
          const parsed = url.parse(src);
          const hash = decodeURIComponent(parsed.hash || '').replace('#', '');
          const absPath = winPath(
            path.resolve(path.parse(opts.fileAbsPath).dir, parsed.pathname!),
          );
          let content = fs.readFileSync(absPath, 'utf-8');

          // extract content by hash (line range or regexp)
          if (hash.startsWith('L')) {
            content = getFileRangeLines(content, hash);
          } else if (hash.startsWith('RE-')) {
            content = getFileContentByRegExp(content, hash.slice(3), absPath);
          }

          // parse partial content to mdast
          const mdast = unified()
            .use(remarkParse)
            // for strip frontmatter
            .use(remarkFrontmatter)
            // for return raw ast
            .use(remarkRawAST)
            .processSync(content).result as Root;

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

          // replace embed tag with mdast
          parent!.children.splice(i!, relatedNodeCount, ...mdast.children);

          // record embed file path for declare loader dependency
          vFile.data.embeds ??= [];
          vFile.data.embeds.push(absPath);
        }
      }
    });
  };
}
