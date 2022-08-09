import type { Root } from 'hast';
import type { Transformer } from 'unified';

let visit: typeof import('unist-util-visit').visit;
let SKIP: typeof import('unist-util-visit').SKIP;

// workaround to import pure esm module
(async () => {
  ({ visit, SKIP } = await import('unist-util-visit'));
})();

export default function rehypeStrip(): Transformer<Root> {
  return (tree) => {
    visit<Root, 'text'>(tree, 'text', (node, index, parent) => {
      // strip all useless break line node, it is means nothing for HTML
      if (/^[\n\r]+$/.test(node.value)) {
        parent?.children.splice(index!, 1);

        // skip and re-visit current index
        return [SKIP, index];
      }
    });
  };
}
