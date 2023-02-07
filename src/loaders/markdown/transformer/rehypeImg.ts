import type { Element, Root } from 'hast';
import path from 'path';
import type { Transformer } from 'unified';

let visit: typeof import('unist-util-visit').visit;

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
})();

function isRelativeUrl(url: string) {
  return (
    !url.startsWith('data:image') &&
    !/^((blob:)?\w+:)?\/\//.test(url) &&
    !path.isAbsolute(url)
  );
}

/**
 * rehype plugin to handle img source from local
 */
export default function rehypeImg(): Transformer<Root> {
  return (tree) => {
    visit<Root, 'element'>(tree, 'element', (node: Element) => {
      if (node.tagName === 'img' && typeof node.properties?.src === 'string') {
        const src = node.properties.src.trim();

        if (src && isRelativeUrl(src)) {
          delete node.properties.src;
          node.JSXAttributes = [
            {
              type: 'JSXAttribute',
              name: 'src',
              value: `require('${decodeURI(src)}')`,
            },
          ];
        }
      }
    });
  };
}
