import type { JSXElement } from '@umijs/bundler-utils/compiled/@babel/types';
import * as parser from '@umijs/bundler-utils/compiled/babel/parser';
import type { JSXExpressionContainer } from 'estree-util-to-js/lib/jsx';
import type { Element, Root, Text } from 'hast';
import type {
  EstreeJsxAttribute,
  EstreeJsxSpreadAttribute,
} from 'hast-util-to-estree/lib';
import type { FrozenProcessor } from 'unified';

let visitUnist: typeof import('unist-util-visit').visit;
let visitEstree: typeof import('estree-util-visit').visit;
let toEstree: typeof import('hast-util-to-estree').toEstree;
let toJs: typeof import('estree-util-to-js').toJs;
let jsx: typeof import('estree-util-to-js').jsx;
const JSX_PROP_PREFIX = '$jsx-prop-';
const JSX_SPREAD_PROP_PREFIX = '$jsx-spread-prop-';

// workaround to import pure esm module
(async () => {
  ({ visit: visitUnist } = await import('unist-util-visit'));
  ({ visit: visitEstree } = await import('estree-util-visit'));
  ({ toEstree } = await import('hast-util-to-estree'));
  ({ toJs, jsx } = await import('estree-util-to-js'));
})();

function getJSXAttrAST(
  node: Extract<
    NonNullable<Element['JSXAttributes']>[0],
    { type: 'JSXAttribute' }
  >,
): EstreeJsxAttribute;
function getJSXAttrAST(
  node: Extract<
    NonNullable<Element['JSXAttributes']>[0],
    { type: 'JSXSpreadAttribute' }
  >,
): EstreeJsxSpreadAttribute;
function getJSXAttrAST(
  node: NonNullable<Element['JSXAttributes']>[0],
): EstreeJsxAttribute | EstreeJsxSpreadAttribute {
  const tmpCode = `<a ${
    node.type === 'JSXAttribute'
      ? `${node.name}={${node.value}}`
      : `{...${node.argument}}`
  } />`;
  // why babel rather than swc?
  // because babel support to return the standard estree
  const ast = parser.parseExpression(tmpCode, {
    plugins: ['jsx', 'estree'],
  }) as JSXElement;

  return ast.openingElement.attributes[0] as any;
}

export default function rehypeJsxify(this: FrozenProcessor) {
  this.Compiler = function Compiler(ast: Root) {
    // stub JSX attributes to object properties
    visitUnist<Root, 'element'>(ast, 'element', (node) => {
      node.JSXAttributes?.forEach((attr, i) => {
        node.properties ??= {};

        if (attr.type === 'JSXAttribute') {
          node.properties[`${JSX_PROP_PREFIX}${attr.name}`] = attr.value;
        } else if (attr.type === 'JSXSpreadAttribute') {
          node.properties[`${JSX_SPREAD_PROP_PREFIX}${i}`] = attr.argument;
        }
      });
    });

    // hast to estree, will strip original `JSXAttributes` property
    const esTree = toEstree(ast, {
      handlers: {
        text: function text(node: Text): JSXExpressionContainer | null {
          const value = String(node.value || '');

          if (!value) return null;

          return {
            type: 'JSXExpressionContainer',
            expression: (node.data?.expression as any) || {
              type: 'Literal',
              value,
            },
          };
        },
      },
    });

    // transform stub JSX attributes to ast JSX attributes
    visitEstree(esTree, (node) => {
      const isStubJSXAttr =
        node.type === 'JSXAttribute' &&
        'name' in node &&
        String(node.name.name).startsWith(JSX_PROP_PREFIX);
      const isStubJSXSpreadAttr =
        node.type === 'JSXAttribute' &&
        'name' in node &&
        String(node.name.name).startsWith(JSX_SPREAD_PROP_PREFIX);

      if (isStubJSXAttr && node.value?.type === 'Literal') {
        // get JSX attribute ast, and replace original node
        const name = String(node.name.name).slice(JSX_PROP_PREFIX.length);
        const ast = getJSXAttrAST({
          type: 'JSXAttribute',
          name,
          value: String(node.value.value),
        });

        node.type = ast.type;
        node.name = ast.name;
        node.value = ast.value;
      } else if (isStubJSXSpreadAttr && node.value?.type === 'Literal') {
        // get JSX spread attribute ast, and replace original node
        const ast = getJSXAttrAST({
          type: 'JSXSpreadAttribute',
          argument: String(node.value.value),
        });
        const copy = node as any;

        copy.type = ast.type;
        copy.argument = ast.argument;
        delete copy.name;
        delete copy.value;
      }
    });

    // estree to jsx string, and strip the last semicolon
    return toJs(esTree, { handlers: jsx }).value.trim().slice(0, -1);
  };
}
