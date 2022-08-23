import fs from 'fs';
import type { Literal, Root } from 'hast';
import path from 'path';
import { logger } from 'umi/plugin-utils';
import type { Transformer } from 'unified';
import type { Parent } from 'unist-util-visit';
import url from 'url';
import { IMdTransformerOptions } from '.';

let visit: typeof import('unist-util-visit').visit;
let unified: typeof import('unified').unified;
let remarkParse: typeof import('remark-parse').default;
let remarkGfm: typeof import('remark-gfm').default;
let remarkRehype: typeof import('remark-rehype').default;
let rehypeRaw: typeof import('rehype-raw').default;

(async () => {
  ({ visit } = await import('unist-util-visit'));
  ({ unified } = await import('unified'));
  remarkParse = (await import('remark-parse')).default;
  remarkGfm = (await import('remark-gfm')).default;
  remarkRehype = (await import('remark-rehype')).default;
  rehypeRaw = (await import('rehype-raw')).default;
})();

const getFileRangeLines = (content: string, range: string) => {
  const [, start, end] = range?.match(/^L(\d+)(?:-L(\d+))?$/) || [];

  if (start) {
    const lineStart = parseInt(start, 10) - 1;
    const lineEnd = end ? parseInt(end, 10) : lineStart + 1;

    return content
      .split(/\r\n|\n/g)
      .slice(lineStart, lineEnd)
      .join('\n');
  }

  return content;
};

const getFileContentByRegExp = (
  content: string,
  regexp: string,
  filePath: string,
) => {
  try {
    // eslint-disable-next-line no-eval
    return content.match(eval(regexp))![0];
  } catch (err) {
    logger.error(`[dumi]: extract content failed, use the full content.
RegExp: ${regexp}
File: ${filePath}
Error: ${err}`);
    return content;
  }
};

export default function rehypeEmbed(
  opts: Pick<IMdTransformerOptions, 'fileAbsPath'>,
): Transformer<Root> {
  return async (tree) => {
    visit<Root, 'html'>(tree, 'html', (node: Literal, _, parent: Parent) => {
      if (node.value.includes('<embed src')) {
        const match = node.value.match(/(src=")([^)]*)"/);
        if (match) {
          const src = match[match.length - 1];
          const parsed = url.parse(src.toString());
          const absPath = path.resolve(
            path.parse(opts.fileAbsPath).dir,
            parsed.pathname!,
          );

          if (absPath) {
            const hash = decodeURIComponent(parsed.hash || '').replace('#', '');
            const query = new URLSearchParams();
            let content = fs.readFileSync(absPath, 'utf8').toString();

            // generate loader query
            if (hash[0] === 'L') {
              query.append('range', hash);
              content = getFileRangeLines(content, hash);
            } else if (hash.startsWith('RE-')) {
              query.append('regexp', hash.substring(3));
              content = getFileContentByRegExp(
                content,
                hash.substring(3),
                absPath,
              );
            }

            // process node via file type
            switch (path.extname(parsed.pathname!)) {
              case '.md':
              default: {
                const processor = unified()
                  .use(remarkParse)
                  .use(remarkGfm)
                  .use(remarkRehype, { allowDangerousHtml: true })
                  .use(rehypeRaw);

                const fileRoot = processor.parse(content);
                parent.children = fileRoot.children;
              }
            }
          }
        }
      }
    });
  };
}
