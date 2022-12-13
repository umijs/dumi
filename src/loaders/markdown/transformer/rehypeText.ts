import type { Element, Root } from 'hast';
import type { Transformer } from 'unified';
import { isReactComponent } from './rehypeIsolation';
import { HEADING_TAGS } from './rehypeSlug';

export const CONTENT_TEXTS_OBJ_NAME = '$$contentTexts';

let visit: typeof import('unist-util-visit-parents').visitParents;

// workaround to import pure esm module
(async () => {
  ({ visitParents: visit } = await import('unist-util-visit-parents'));
})();

function findParagraphAncestor(ancestors: (Root | Element)[]) {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const node = ancestors[i];

    if (
      (node.type === 'element' &&
        (['p', 'ul', 'ol'].includes(node.tagName) || isReactComponent(node))) ||
      node.type === 'root'
    ) {
      return node;
    }
  }
}

function findClosestTitle(ancestors: (Root | Element)[], node: Element) {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const parent = ancestors[i];
    const current: any = ancestors[i + 1] || node;

    // find ancestor siblings from ancestor position to start
    for (let i = parent.children.indexOf(current) - 1; i >= 0; i--) {
      const child = parent.children[i];

      if (child.type === 'element' && HEADING_TAGS.includes(child.tagName)) {
        return child;
      }
    }
  }
}

export default function rehypeText(): Transformer<Root> {
  return (tree, vFile) => {
    let textId = 0;
    let paraId = 0;

    vFile.data.texts = [];

    visit<Root, 'text'>(tree, 'text', (node, ancestors) => {
      const parent = ancestors[ancestors.length - 1];

      // skip text in heading, because heading is already collected in toc data
      if (parent.type !== 'element' || !HEADING_TAGS.includes(parent.tagName)) {
        const paraNode = findParagraphAncestor(ancestors)!;
        const titleNode =
          paraNode.type === 'element' && findClosestTitle(ancestors, paraNode);
        let tocIndex = -1;

        // find title index in toc
        if (titleNode) {
          tocIndex = vFile.data.toc!.findIndex(
            ({ id }) => id === titleNode.properties?.id,
          );
        }

        // generate paragraph id
        paraNode.data ??= {};
        paraNode.data!.id ??= paraId++;

        // set member expression to text node
        node.data = {
          expression: {
            type: 'MemberExpression',
            start: node.position?.start,
            end: node.position?.end,
            object: {
              type: 'MemberExpression',
              computed: true,
              object: {
                type: 'Identifier',
                name: CONTENT_TEXTS_OBJ_NAME,
              },
              property: {
                type: 'Literal',
                value: textId++,
              },
            },
            property: {
              type: 'Identifier',
              name: 'value',
            },
          },
        };

        // save text object in vFile
        vFile.data.texts!.push({
          value: node.value,
          paraId: paraNode.data!.id as number,
          ...(tocIndex > -1 ? { tocIndex } : {}),
        });
      }
    });
  };
}
