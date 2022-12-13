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

/**
 * Checks if `node` is a reactComponent
 */
export function isReactComponent(node: Element) {
  // FIXME: exclude Link, and read from themeData
  return /^[A-Z].+/.test(node.tagName);
}

export default function rehypeIsolation(): Transformer<Root> {
  return (tree) => {
    visit<Root, 'root'>(tree, 'root', (node) => {
      node.children = (node.children as Element[]).reduce<Element[]>(
        (nextChildren, current) => {
          let prevSibling = nextChildren[nextChildren.length - 1] as
            | Element
            | undefined;
          if (isDemoNode(current)) {
            // Do nothing if current node is a demo node
            nextChildren.push(current);
          } else if (
            // <p><Test></Test></p> or <Test></Test>
            (current.tagName === 'p' &&
              current.children?.length === 1 &&
              isReactComponent(current.children[0] as Element)) ||
            isReactComponent(current)
          ) {
            // solo for user custom component
            nextChildren.push(
              current.tagName === 'p'
                ? (current.children?.[0] as Element)
                : current,
            );
          } else {
            // Ensure the previous sibling is a wrapper element node
            // So that dumi could append the current node into wrapper
            if (
              !prevSibling ||
              isDemoNode(prevSibling) ||
              isReactComponent(prevSibling)
            ) {
              prevSibling = {
                type: 'element',
                tagName: 'div',
                properties: { className: ['markdown'] },
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
