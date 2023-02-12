import { getFileContentByRegExp, getFileRangeLines } from '@/utils';
import enhancedResolve from 'enhanced-resolve';
import fs from 'fs';
import type { Root } from 'mdast';
import path from 'path';
import { winPath } from 'umi/plugin-utils';
import url from 'url';

interface ParseEmbedOptions {
  fileAbsPath: string;
  alias: object;
}

interface ParseEmbedResult {
  content: string;
  embeds: string[];
}

interface EmbedNode {
  start_offset: number;
  end_offset: number;
  replace: string;
  embeds: string[];
}

const EMBED_OPEN_TAG = '<embed ';
const EMBED_CLOSE_TAG = '</embed>';

let visit: typeof import('unist-util-visit-parents').visitParents;
let unified: typeof import('unified').unified;
let remarkParse: typeof import('remark-parse').default;
let remarkStringify: typeof import('remark-stringify').default;
let fromMarkdown: typeof import('mdast-util-from-markdown').fromMarkdown;

// workaround to import pure esm module
(async () => {
  ({ visitParents: visit } = await import('unist-util-visit-parents'));
  ({ unified } = await import('unified'));
  ({ default: remarkParse } = await import('remark-parse'));
  ({ default: remarkStringify } = await import('remark-stringify'));
  ({ fromMarkdown } = await import('mdast-util-from-markdown'));
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
    return winPath(
      path
        .relative(path.dirname(parentAbsPath), absPath)
        // add leading ./
        .replace(/^([^.])/, './$1'),
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

function replaceEmbedRltPath(
  parentAbsPath: string,
  fileAbsPath: string,
  content: string,
) {
  const result = unified()
    .use(remarkParse)
    // for update relative src path
    .use(remarkReplaceSrc, {
      fileAbsPath,
      parentAbsPath,
    })
    .use(remarkStringify)
    .processSync(content);
  return String(result);
}

export default function parseEmbed(
  content: string,
  opts: ParseEmbedOptions,
): ParseEmbedResult {
  const resolver = enhancedResolve.create.sync({
    extensions: ['.md'],
    alias: opts.alias,
  });
  const tree = fromMarkdown(content);
  const embedNodes: EmbedNode[] = [];
  visit<Root, 'html'>(tree, 'html', (node) => {
    // console.log(node)
    if (!node.value.startsWith(EMBED_OPEN_TAG)) return;
    if (
      !node.position ||
      !node.position.start.offset ||
      !node.position.end.offset
    )
      return;
    const src = node.value.match(/src=("|')([^"']+)\1/)?.[2];
    if (!src) return;
    // parse url
    const parsed = url.parse(src);
    const hash = decodeURIComponent(parsed.hash || '').replace('#', '');
    const absPath = resolver(
      path.dirname(opts.fileAbsPath),
      parsed.pathname!,
    ) as string;
    // parse content
    let embedContent = fs.readFileSync(absPath, 'utf-8');
    // extract content by hash (line range or regexp)
    if (hash.startsWith('L')) {
      embedContent = getFileRangeLines(embedContent, hash);
    } else if (hash.startsWith('RE-')) {
      embedContent = getFileContentByRegExp(
        embedContent,
        hash.slice(3),
        absPath,
      );
    }
    embedContent = replaceEmbedRltPath(opts.fileAbsPath, absPath, embedContent);
    // parse nest embed
    const nestEmbed = parseEmbed(embedContent, {
      ...opts,
      fileAbsPath: absPath,
    });
    embedNodes.push({
      start_offset: node.position.start.offset as number,
      end_offset: node.position.end.offset as number,
      replace: nestEmbed.content,
      embeds: [absPath, ...nestEmbed.embeds],
    });
  });

  let newContent = content;
  let embeds: string[] = [];
  embedNodes.reverse().forEach((node) => {
    // console.log(node)
    const startStr = newContent.substring(0, node.start_offset);
    let endStr = newContent.substring(node.end_offset);
    if (endStr.startsWith(EMBED_CLOSE_TAG))
      endStr = endStr.replace(EMBED_CLOSE_TAG, '');
    newContent = startStr + node.replace + endStr;
    embeds = [...embeds, ...node.embeds];
  });

  return {
    content: newContent,
    embeds,
  };
}
