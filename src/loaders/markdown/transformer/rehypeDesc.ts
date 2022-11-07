import type { Root } from 'hast';
import type { Transformer } from 'unified';

let visit: typeof import('unist-util-visit').visit;
let EXIT: typeof import('unist-util-visit').EXIT;
let toString: typeof import('hast-util-to-string').toString;

(async () => {
  ({ visit, EXIT } = await import('unist-util-visit'));
  ({ toString } = await import('hast-util-to-string'));
})();

/**
 * rehype plugin for extract fallback description from markdown content
 */
export default function rehypeDesc(): Transformer<Root> {
  return async (tree, vFile) => {
    // skip if user has defined description
    if (!vFile.data.frontmatter!.description) {
      visit<Root, 'element'>(tree, 'element', (node) => {
        if (node.tagName === 'p') {
          const text = toString(node).trim();

          if (text) {
            vFile.data.frontmatter!.description = text;
            return EXIT;
          }
        }
      });
    }
  };
}
