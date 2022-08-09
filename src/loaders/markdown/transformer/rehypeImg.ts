import path from 'path';
import type { Element, Root } from 'hast';
import type { Transformer } from 'unified';

let visit: typeof import('unist-util-visit').visit;
let hasProperty: typeof import('hast-util-has-property').hasProperty;
let isElement: typeof import('hast-util-is-element').isElement;

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
  ({ hasProperty } = await import('hast-util-has-property'));
  ({ isElement } = await import('hast-util-is-element'));
})();

function isRelativeUrl(url: string) {
  return typeof url === 'string' && !/^(?:(?:blob:)?\w+:)?\/\//.test(url) && !path.isAbsolute(url);
}

/**
 * rehype plugin to handle img source from local
 */
 export default function rehypeImg(): Transformer<Root> {
  return tree => {
    visit<Root, 'element'>(tree, 'element', (node: Element) => {
      if (isElement(node, 'img') && hasProperty(node, 'src')) {
        const src = node.properties!.src as string;

        if (isRelativeUrl(src)) {
          // use wrapper element to workaround for skip props escape
          // https://github.com/mapbox/jsxtreme-markdown/blob/main/packages/hast-util-to-jsx/index.js#L159
          // eslint-disable-next-line no-new-wrappers
          node.properties!.src = `require('${decodeURI(src)}')`;
        }
      }
    });
  };
}
