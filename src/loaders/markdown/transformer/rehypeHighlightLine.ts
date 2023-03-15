import type { Root } from 'hast';
import type { Transformer } from 'unified';

let visit: typeof import('unist-util-visit').visit;
let isElement: typeof import('hast-util-is-element').isElement;

const RE = /{((?:\d+(?:-\d+)?,?)+)}/;

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
  ({ isElement } = await import('hast-util-is-element'));
})();

const attrsToLines = (attrs: string) => {
  const result: number[] = [];
  attrs
    .split(',')
    .map((v) => v.split('-').map((v) => parseInt(v, 10)))
    .forEach(([start, end = start]) => {
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
    });
  return result;
};

function rehypeHighlightLine(): Transformer<Root> {
  return async (tree) => {
    visit<Root, 'element'>(tree, 'element', (node) => {
      if (isElement(node, 'code') && typeof node.data?.meta === 'string') {
        const lines = node.data.meta.match(RE)?.[1];

        if (lines) {
          // ensure the next plugin get the correct lang
          node.data.meta = node.data.meta.replace(lines, '').trim();

          node.data.highlightLines = attrsToLines(lines);
        }
      }
    });
  };
}

export default rehypeHighlightLine;
