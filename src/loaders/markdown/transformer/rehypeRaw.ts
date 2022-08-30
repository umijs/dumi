import type { Root } from 'hast';
import type { Transformer } from 'unified';

let raw: typeof import('hast-util-raw').raw;
let visit: typeof import('unist-util-visit').visit;
const COMPONENT_NAME_REGEX = /<[A-Z][a-zA-Z\d]*/g;
const COMPONENT_STUB_ATTR = '$tag-name';

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
  ({ raw } = await import('hast-util-raw'));
})();

export default function rehypeRaw(): Transformer<Root> {
  return (tree, file) => {
    // mark tagName for all custom react component
    // because the parse5 within hast-util-raw will lowercase all tag names
    visit<Root>(tree, (node) => {
      if (node.type === 'raw' && COMPONENT_NAME_REGEX.test(node.value)) {
        node.value = node.value.replace(COMPONENT_NAME_REGEX, (str) => {
          const tagName = str.slice(1);

          return `${str} ${COMPONENT_STUB_ATTR}="${tagName}"`;
        });
      }
    });

    const newTree = raw(tree, file) as Root;

    // restore tagName for all custom react component
    visit<Root, 'element'>(newTree, 'element', (node) => {
      if (node.properties?.[COMPONENT_STUB_ATTR]) {
        node.tagName = node.properties[COMPONENT_STUB_ATTR] as string;
        delete node.properties[COMPONENT_STUB_ATTR];
      }
    });

    return newTree;
  };
}
