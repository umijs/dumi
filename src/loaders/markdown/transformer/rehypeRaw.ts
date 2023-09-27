import type { Root } from 'hast';
import { logger } from 'umi/plugin-utils';
import type { Transformer } from 'unified';
import type { IMdTransformerOptions } from '.';

let raw: typeof import('hast-util-raw').raw;
let visit: typeof import('unist-util-visit').visit;
const COMPONENT_NAME_REGEX = /(<)([A-Z][a-zA-Z\d]*)([\s|>])/g;
const COMPONENT_PROP_REGEX = /\s[a-z][a-z\d]*[A-Z]+[a-zA-Z\d]*(=|\s|>)/g;
const COMPONENT_STUB_ATTR = '$tag-name';
const PROP_STUB_ATTR = '-$u';
const PROP_STUB_ATTR_REGEX = new RegExp(
  `${PROP_STUB_ATTR.replace('$', '\\$')}[a-z]`,
  'g',
);
const CODE_META_STUB_ATTR = '$code-meta';

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
  ({ raw } = await import('hast-util-raw'));
})();

type IRehypeRawOptions = Pick<IMdTransformerOptions, 'fileAbsPath'>;

export default function rehypeRaw(opts: IRehypeRawOptions): Transformer<Root> {
  return (tree, vFile) => {
    visit<Root>(tree, (node) => {
      if (node.type === 'raw' && COMPONENT_NAME_REGEX.test(node.value)) {
        // mark tagName for all custom react component
        // because the parse5 within hast-util-raw will lowercase all tag names
        node.value = node.value.replace(
          COMPONENT_NAME_REGEX,
          (str, bracket, tagName, next, i, full) => {
            const isWithinQuotes =
              (/="[^"]*$/.test(full.slice(0, i)) &&
                /^[^"]*"/.test(full.slice(i))) ||
              (/='[^']*$/.test(full.slice(0, i)) &&
                /^[^']*'/.test(full.slice(i)));

            // skip if tagName is part of attr value
            return isWithinQuotes
              ? str
              : `${bracket}${tagName} ${COMPONENT_STUB_ATTR}="${tagName}"${next}`;
          },
        );
        // mark all camelCase props for all custom react component
        // because the parse5 within hast-util-raw will lowercase all attr names
        node.value = node.value.replace(COMPONENT_PROP_REGEX, (str) => {
          return str.replace(
            /[A-Z]/g,
            (s) => `${PROP_STUB_ATTR}${s.toLowerCase()}`,
          );
        });
      } else if (node.type === 'element' && node.data?.meta) {
        // save code meta to properties to avoid lost
        // ref: https://github.com/syntax-tree/hast-util-raw/issues/13#issuecomment-912451531
        node.properties ??= {};
        node.properties[CODE_META_STUB_ATTR] = node.data.meta as string;
      }

      if (node.type === 'raw' && /<code[^>]*src=[^>]*\/>/.test(node.value)) {
        logger.warn(`<code /> is not supported, please use <code></code> instead.
File: ${opts.fileAbsPath}`);
      }
    });

    const newTree = raw(tree, { file: vFile }) as Root;

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

      // restore all camelCase props
      Object.keys(node.properties || {}).forEach((p) => {
        if (PROP_STUB_ATTR_REGEX.test(p)) {
          const originalName = p.replace(PROP_STUB_ATTR_REGEX, (s) =>
            s.slice(PROP_STUB_ATTR.length).toUpperCase(),
          );

          node.properties![originalName] = node.properties![p];
          // compatible legacy usage
          node.properties![originalName.toLowerCase()] = node.properties![p];
          delete node.properties![p];
        }
      });
    });

    return newTree;
  };
}
