import type { Root } from 'hast';
import type { Transformer } from 'unified';

let visit: typeof import('unist-util-visit').visit;
let isElement: typeof import('hast-util-is-element').isElement;
let toString: typeof import('hast-util-to-string').toString;

(async () => {
  ({ visit } = await import('unist-util-visit'));
  ({ isElement } = await import('hast-util-is-element'));
  ({ toString } = await import('hast-util-to-string'));
})();

export default function rehypeEnhancedTag(): Transformer<Root> {
  return async (tree) => {
    visit<Root, 'element'>(tree, 'element', (node, i, parent) => {
      if (
        node.tagName === 'pre' &&
        isElement(node.children?.[0]) &&
        node.children[0].tagName === 'code'
      ) {
        const className = (node.children[0].properties?.className ||
          []) as string[];
        const lang = className.join('').match(/language-(\w+)(?:$| )/)?.[1];
        const highlightLines = node.children[0].data
          ?.highlightLines as number[];

        parent!.children.splice(i!, 1, {
          type: 'element',
          tagName: 'SourceCode',
          properties: { lang },
          data: node.children[0].data,
          JSXAttributes: [
            {
              type: 'JSXAttribute',
              name: 'highlightLines',
              value: JSON.stringify(highlightLines),
            },
          ],
          children: [
            {
              type: 'text',
              value: toString(node.children[0]),
            },
          ],
        });
      } else if (node.tagName === 'table') {
        // use enhanced Table component
        node.tagName = 'Table';
      } else if (node.tagName === 'style') {
        // use dangerouslySetInnerHTML for style tag, to avoid HTML entities be escaped
        node.JSXAttributes = [
          {
            type: 'JSXAttribute',
            name: 'dangerouslySetInnerHTML',
            value: JSON.stringify({
              __html: toString(node),
            }),
          },
        ];
        node.children = [];
      }
    });
  };
}
