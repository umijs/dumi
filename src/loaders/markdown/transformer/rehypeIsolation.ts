import type { Element, Root } from 'hast';
import type { Transformer } from 'unified';

let visit: typeof import('unist-util-visit').visit;

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
})();

/**
 * Checks if `node` is a demo node
 */
function isDemoNode(node: Element) {
  return ['DumiDemo', 'DumiDemoGrid'].includes(node.tagName);
}

export default function rehypeIsolation(): Transformer<Root> {
  return (tree) => {
    visit<Root, 'root'>(tree, 'root', (node) => {
      node.children = node.children.reduce<Element[]>(
        (nextChildren, current) => {
          let prevSibling = nextChildren[nextChildren.length - 1] as
            | Element
            | undefined;
          if (isDemoNode(current as Element)) {
            // Do nothing if current node is a demo node
            nextChildren.push(current as Element);
          } else {
            // Ensure the previous sibling is a wrapper element node
            // So that dumi could append the current node into wrapper
            if (!prevSibling || isDemoNode(prevSibling)) {
              prevSibling = {
                type: 'element',
                tagName: 'div',
                properties: { className: 'markdown' },
                children: [],
              };

              nextChildren.push(prevSibling);
            }

            prevSibling.children.push(current as Element);
          }

          return nextChildren;
        },
        [],
      );
    });
  };
}
