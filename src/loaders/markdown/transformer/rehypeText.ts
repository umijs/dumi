import type { Element, Root } from 'hast';
import type { Transformer } from 'unified';
import { HEADING_TAGS } from './rehypeSlug';

let visit: typeof import('unist-util-visit-parents').visitParents;
let toString: typeof import('hast-util-to-string').toString;

// workaround to import pure esm module
(async () => {
  ({ visitParents: visit } = await import('unist-util-visit-parents'));
  ({ toString } = await import('hast-util-to-string'));
})();

function findParagraphAncestor(ancestors: (Root | Element)[]) {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const node = ancestors[i];

    if (
      (node.type === 'element' && node.tagName === 'p') ||
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
    const beforeSiblings = parent.children.slice(
      0,
      parent.children.indexOf(current),
    );
    const title = beforeSiblings.find(
      (child) =>
        child.type === 'element' && HEADING_TAGS.includes(child.tagName),
    );

    if (title) return title;
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
        const index = parent.children.indexOf(node);
        const paraNode = findParagraphAncestor(ancestors)!;
        const titleNode =
          paraNode.type === 'element' && findClosestTitle(ancestors, paraNode);
        let tocIndex = -1;

        // find title index in toc
        if (titleNode) {
          const title = toString(titleNode);
          tocIndex = vFile.data.toc!.findIndex((item) => item.title === title);
        }

        // generate paragraph id
        paraNode.data ??= {};
        paraNode.data!.id ??= paraId++;

        // replace original node to DumiText internal component
        parent.children.splice(index, 1, {
          type: 'element',
          tagName: 'DumiText',
          JSXAttributes: [
            { type: 'JSXAttribute', name: 'id', value: String(textId++) },
          ],
          children: [],
        });

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
