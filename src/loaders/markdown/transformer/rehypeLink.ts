import type { Root } from 'hast';
import path from 'path';
import { lodash } from 'umi/plugin-utils';
import type { Transformer } from 'unified';
import url from 'url';
import type { IMdTransformerOptions } from '.';

let visit: typeof import('unist-util-visit').visit;
let SKIP: typeof import('unist-util-visit').SKIP;

// workaround to import pure esm module
(async () => {
  ({ visit, SKIP } = await import('unist-util-visit'));
})();

type IRehypeLinkOptions = Pick<
  IMdTransformerOptions,
  'fileAbsPath' | 'routers'
>;

export default function rehypeLink(
  opts: IRehypeLinkOptions,
): Transformer<Root> {
  return (tree) => {
    visit<Root, 'element'>(tree, 'element', (node, i, parent) => {
      if (node.tagName === 'a' && typeof node.properties?.href === 'string') {
        const href = node.properties.href;
        const parsedUrl = url.parse(href);

        // handle internal link
        if (parsedUrl.hostname) return SKIP;

        // handle markdown link
        if (/\.md$/i.test(parsedUrl.pathname!)) {
          const { routers } = opts;
          const absPath = path.resolve(
            opts.fileAbsPath,
            '..',
            parsedUrl.pathname!,
          );

          Object.keys(routers).forEach((key) => {
            if (routers[key].file === absPath) {
              parsedUrl.pathname = routers[key].absPath;
            }
          });
        }

        parent!.children.splice(i!, 1, {
          type: 'element',
          tagName: 'Link',
          children: node.children,
          properties: {
            ...lodash.omit(node.properties, ['href']),
            to: url.format(parsedUrl),
          },
        });
      }
    });
  };
}
