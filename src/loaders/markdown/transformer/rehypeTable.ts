import type { Root } from 'hast';
import type { Transformer } from 'unified';

let visit: typeof import('unist-util-visit').visit;

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
})();

/**
 * rehype plugin to handle table element to component
 */
export default function rehypeTable(): Transformer<Root> {
  return (tree) => {
    visit<Root, 'element'>(tree, 'element', (node) => {
      if (node.tagName === 'table') {
        node.tagName = 'Table';
      }
    });
  };
}
