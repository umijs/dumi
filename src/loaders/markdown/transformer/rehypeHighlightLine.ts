import type { Root } from 'hast';
import type { Transformer } from 'unified';
import type { IMdTransformerOptions } from '.';

let visit: typeof import('unist-util-visit').visit;
let isElement: typeof import('hast-util-is-element').isElement;

const RE = /{([\d,-]+)}/;

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
  ({ isElement } = await import('hast-util-is-element'));
})();

type IRehypeHighlightLine = Pick<IMdTransformerOptions, 'resolve'>;

const attrsToLines = (rawAttrs: string) => {
  const attrs = rawAttrs.replace(/^(?:\[.*?\])?.*?([\d,-]+).*/, '$1').trim();
  const result: number[] = [];
  attrs
    ?.split(',')
    .map((v) => v.split('-').map((v) => parseInt(v, 10)))
    .forEach(([start, end]) => {
      if (start && end) {
        result.push(
          ...Array.from({ length: end - start + 1 }, (_, i) => start + i),
        );
      } else {
        result.push(start);
      }
    });
  return result;
};

function rehypeHighlightLine(opts: IRehypeHighlightLine): Transformer<Root> {
  return async (tree) => {
    const { resolve } = opts;
    visit<Root, 'element'>(tree, 'element', (node) => {
      if (isElement(node, 'code') && typeof node.data?.meta === 'string') {
        const lines = node.data.meta.match(RE);
        if (lines) {
          const lineNumbers = attrsToLines(lines[1]);

          // ensure the next plugin get the correct lang
          let meta = node.data.meta.replace(RE, '').trim();

          // active mode (default)
          if (
            resolve.codeBlockMode === 'active' &&
            !/ pure/.test(String(node.data?.meta))
          ) {
            // add pure keyword
            meta += ' pure';
          }
          // passive mode
          if (
            resolve.codeBlockMode === 'passive' &&
            / demo/.test(String(node.data?.meta))
          ) {
            // remove demo keyword
            meta = meta.replace('demo', '').trim();
          }

          node.data.meta = meta;
          node.data.highlightLines = lineNumbers;
        }
      }
    });
  };
}

export default rehypeHighlightLine;
