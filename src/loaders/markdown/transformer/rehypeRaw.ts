import type { Element, ElementContent, Root } from 'hast';
import { DomUtils, parseDOM } from 'htmlparser2';
import { logger } from 'umi/plugin-utils';
import type { Transformer } from 'unified';
import type { IMdTransformerOptions } from '.';

let raw: typeof import('hast-util-raw').raw;
let visit: typeof import('unist-util-visit').visit;
/** https://regex101.com/r/q6HP5w/1 */
const REACT_JSX_REGEX = /<([A-Z][a-zA-Z0-9]*)\s*[^>]*>[\s\S]*<\/\1>/g;
const CODE_META_STUB_ATTR = '$code-meta';
const COMPONENT_NAME_REGEX = /[A-Z][a-zA-Z\d]*$/;
const COMPONENT_STUB_ATTR = '$tag-name';

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
  ({ raw } = await import('hast-util-raw'));
})();

type IRehypeRawOptions = Pick<IMdTransformerOptions, 'fileAbsPath'>;
type ChildNode = ReturnType<(typeof DomUtils)['getChildren']>[number];

/**
 * These elements are not allowed to have children
 * copied from https://github.com/peternewnham/react-html-parser/blob/master/src/dom/elements/VoidElements.js
 */
const voidElements = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

function isEmptyTextNode(node: ChildNode) {
  return (
    node.type === 'text' && /\r?\n/.test(node.data) && node.data.trim() === ''
  );
}

/**
 *  Converts any element to a html element.
 */
function convertTagToElement(node: ChildNode): ElementContent | void {
  if (DomUtils.isTag(node)) {
    const element: Element = {
      type: 'element',
      tagName: node.name,
      properties: {
        ...node.attribs,
        [COMPONENT_STUB_ATTR]: COMPONENT_NAME_REGEX.test(node.name)
          ? node.name
          : undefined,
      },
      children: [],
    };

    if (voidElements.indexOf(node.name) === -1) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      element.children = processNodes(node.children);
    }

    return element;
  } else if (DomUtils.isText(node)) {
    return {
      type: 'text',
      value: node.data,
    };
  }
}

function processNodes(nodes: ChildNode[]) {
  return nodes
    .filter((node) => !isEmptyTextNode(node))
    .map(convertTagToElement)
    .filter(Boolean) as Element[];
}

function rehypeRaw(opts: IRehypeRawOptions): Transformer<Root> {
  return (tree, vFile) => {
    visit<Root>(tree, (node) => {
      if (node.type === 'raw' && `${node.value}`.match(REACT_JSX_REGEX)) {
        (node.type as any) = 'root';
        const nodes = parseDOM(node.value, {
          lowerCaseTags: false,
          lowerCaseAttributeNames: false,
        });
        (node as any).children = processNodes(nodes);
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
        node.tagName = node.properties[COMPONENT_STUB_ATTR] as string;
        delete node.properties[COMPONENT_STUB_ATTR];
      }
    });

    return newTree;
  };
}

export default rehypeRaw;
