import type { Root } from 'hast';
import type { Transformer } from 'unified';

let raw: typeof import('hast-util-raw').raw;
let visit: typeof import('unist-util-visit').visit;
const COMPONENT_NAME_REGEX = /<[A-Z][a-zA-Z\d]*/g;
const COMPONENT_STUB_ATTR = '$tag-name';
const CODE_META_STUB_ATTR = '$code-meta';

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
  ({ raw } = await import('hast-util-raw'));
})();

export default function rehypeRaw(): Transformer<Root> {
  return (tree, file) => {
    visit<Root>(tree, (node) => {
      if (node.type === 'raw' && COMPONENT_NAME_REGEX.test(node.value)) {
        // mark tagName for all custom react component
        // because the parse5 within hast-util-raw will lowercase all tag names
        node.value = node.value.replace(COMPONENT_NAME_REGEX, (str) => {
          const tagName = str.slice(1);

          return `${str} ${COMPONENT_STUB_ATTR}="${tagName}"`;
        });
      } else if (node.type === 'element' && node.data?.meta) {
        // save code meta to properties to avoid lost
        // ref: https://github.com/syntax-tree/hast-util-raw/issues/13#issuecomment-912451531
        node.properties ??= {};
        node.properties[CODE_META_STUB_ATTR] = node.data.meta as string;
      }
    });

    const newTree = raw(tree, file) as Root;

    visit<Root, 'element'>(newTree, 'element', (node) => {
      if (node.properties?.[COMPONENT_STUB_ATTR]) {
        // restore tagName for all custom react component
        node.tagName = node.properties[COMPONENT_STUB_ATTR] as string;
        delete node.properties[COMPONENT_STUB_ATTR];
      } else if (node.properties?.[CODE_META_STUB_ATTR]) {
        // restore meta data for code element
        node.data = { meta: node.properties[CODE_META_STUB_ATTR] };
        delete node.properties[CODE_META_STUB_ATTR];
      }
    });

    return newTree;
  };
}
